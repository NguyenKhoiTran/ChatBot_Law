from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import LegalDocument, User
from ..schemas import DocumentOut
from ..utils import (
    extract_text_from_pdf, extract_text_from_docx,
    clean_legal_text, split_into_articles, detect_doc_type
)
from ..rag_engine import rag_engine
from ..routers.auth import get_current_user

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Pipeline nạp dữ liệu (Indexing):
    1. Nhận file PDF/DOCX
    2. Trích xuất text
    3. Làm sạch
    4. Tách theo Điều luật
    5. Embed + lưu vào ChromaDB
    6. Lưu metadata vào PostgreSQL
    """
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF và DOCX")

    content = await file.read()

    # 2. Extract
    if file.filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(content)
    else:
        raw_text = extract_text_from_docx(content)

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Không thể đọc nội dung file. File có thể bị lỗi hoặc chỉ chứa ảnh.")

    # 3. Clean
    cleaned_text = clean_legal_text(raw_text)

    # 4. Split
    articles = split_into_articles(cleaned_text)
    if not articles:
        raise HTTPException(status_code=422, detail="Không tìm thấy điều luật nào trong file. Kiểm tra định dạng văn bản.")

    # 5. Detect type & Index into ChromaDB
    doc_type = detect_doc_type(file.filename, cleaned_text)
    metadatas = [
        {"source": file.filename, "doc_type": doc_type, "article_index": i}
        for i in range(len(articles))
    ]
    rag_engine.add_documents(articles, metadatas)

    # 6. Save metadata to PostgreSQL
    doc_record = LegalDocument(
        filename=file.filename,
        doc_type=doc_type,
        article_count=len(articles)
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    return doc_record


@router.get("/", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Danh sách các văn bản pháp luật đã được nạp vào hệ thống."""
    return db.query(LegalDocument).order_by(LegalDocument.uploaded_at.desc()).all()


@router.get("/stats")
def get_stats(current_user: User = Depends(get_current_user)):
    """Thống kê số điều luật trong Vector DB."""
    return {
        "total_vectors": rag_engine.vector_store.count(),
        "embedding_model": rag_engine.embedder.model.get_sentence_embedding_dimension()
    }
