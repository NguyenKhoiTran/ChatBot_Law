import os
import re
import sys
import win32com.client
from docx import Document

# Add parent directory of backend to sys.path
workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if workspace_dir not in sys.path:
    sys.path.insert(0, workspace_dir)

from backend.utils import extract_text_from_pdf, extract_text_from_docx, clean_legal_text, split_into_articles, detect_doc_type, build_article_metadata, extract_doc_title
from backend.rag_engine import rag_engine
from backend.database import SessionLocal, engine, Base
from backend.models import LegalDocument

RAW_DATA_DIR = os.path.join(workspace_dir, "raw_data")
CLEANED_DATA_DIR = os.path.join(workspace_dir, "cleaned_data")

def convert_single_doc_to_docx(doc_path):
    """Convert một file .doc sang .docx sử dụng Microsoft Word COM, cực kỳ robust."""
    docx_path = os.path.splitext(doc_path)[0] + ".docx"
    
    # Nếu đã tồn tại file .docx rồi, bỏ qua không convert lại
    if os.path.exists(docx_path):
        return docx_path
        
    abs_doc_path = os.path.abspath(doc_path)
    abs_docx_path = os.path.abspath(docx_path)
    
    print(f"Đang convert: {os.path.basename(doc_path)} -> {os.path.basename(docx_path)}")
    word = None
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0  # Suppress all alerts and dialogs
        
        doc = word.Documents.Open(abs_doc_path, ConfirmConversions=False, ReadOnly=True)
        # wdFormatXMLDocument = 16
        doc.SaveAs2(abs_docx_path, FileFormat=16)
        doc.Close(False)
        return docx_path
    except Exception as e:
        print(f"Lỗi khi convert file {os.path.basename(doc_path)}: {e}")
        # Xóa file docx lỗi nếu có tạo ra dở dang
        if os.path.exists(docx_path):
            try:
                os.remove(docx_path)
            except Exception:
                pass
        return None
    finally:
        if word:
            try:
                word.Quit()
            except Exception:
                pass

def process_files():
    # Khởi tạo DB nếu chưa có các bảng
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not os.path.exists(RAW_DATA_DIR):
        print(f"Thư mục dữ liệu raw_data không tồn tại tại {RAW_DATA_DIR}")
        return

    os.makedirs(CLEANED_DATA_DIR, exist_ok=True)

    # 1. Tìm tất cả các file .doc để convert hàng loạt trước
    doc_files = []
    for root, dirs, files in os.walk(RAW_DATA_DIR):
        for file in files:
            if file.endswith(".doc") and not file.startswith("~$"):
                doc_files.append(os.path.join(root, file))
                
    if doc_files:
        print(f"Tìm thấy {len(doc_files)} file .doc cần xử lý chuyển đổi.")
        for doc_path in doc_files:
            convert_single_doc_to_docx(doc_path)

    # 2. Quét lại toàn bộ thư mục để lấy các file PDF và DOCX (bao gồm cả các file .docx vừa được convert)
    files_to_process = []
    for root, dirs, files in os.walk(RAW_DATA_DIR):
        for file in files:
            if file.endswith(('.pdf', '.docx')) and not file.startswith("~$"):
                # Lấy relative path từ RAW_DATA_DIR để bảo toàn cấu trúc thư mục khi lưu text sạch
                rel_path = os.path.relpath(os.path.join(root, file), RAW_DATA_DIR)
                files_to_process.append((os.path.join(root, file), rel_path))

    if not files_to_process:
        print("Không tìm thấy file PDF hoặc DOCX nào trong raw_data.")
        return

    print(f"\nBắt đầu trích xuất text, làm sạch và nạp dữ liệu cho {len(files_to_process)} file...")

    for file_path, rel_path in files_to_process:
        filename = os.path.basename(file_path)
        print(f"\nĐang xử lý: {rel_path}...")

        # Kiểm tra xem file đã được lưu trong DB chưa
        existing_doc = db.query(LegalDocument).filter_by(filename=filename).first()
        if existing_doc:
            print(f"-> File {filename} đã được xử lý trước đó (Bỏ qua).")
            continue

        try:
            # Đọc binary của file
            with open(file_path, "rb") as f:
                content = f.read()

            # Trích xuất text
            if file_path.endswith('.pdf'):
                raw_text = extract_text_from_pdf(content)
            else:
                raw_text = extract_text_from_docx(content)

            if not raw_text.strip():
                print(f"-> Không thể trích xuất văn bản từ {filename} (File rỗng hoặc chỉ chứa hình ảnh).")
                continue

            # Làm sạch văn bản pháp luật
            cleaned_text = clean_legal_text(raw_text)

            # Lưu văn bản đã làm sạch ra file .txt trong cleaned_data
            cleaned_txt_rel_path = os.path.splitext(rel_path)[0] + ".txt"
            cleaned_txt_abs_path = os.path.join(CLEANED_DATA_DIR, cleaned_txt_rel_path)
            
            # Tạo các thư mục con tương ứng nếu chưa có
            os.makedirs(os.path.dirname(cleaned_txt_abs_path), exist_ok=True)
            
            with open(cleaned_txt_abs_path, "w", encoding="utf-8") as f_out:
                f_out.write(cleaned_text)
            print(f"-> Đã lưu text sạch tại: cleaned_data/{cleaned_txt_rel_path}")

            # Tách thành các chunk (mô hình 'embed nhỏ – lưu lớn': mỗi chunk có
            # 'document' đầy đủ để lưu/đưa cho LLM và 'embed' cô đọng để tạo vector)
            chunks = split_into_articles(cleaned_text)
            if not chunks:
                print(f"-> Không tìm thấy Điều luật nào theo định dạng quy chuẩn trong {filename}.")
                continue

            documents   = [c["document"] for c in chunks]
            embed_texts = [c["embed"] for c in chunks]

            # Phát hiện loại văn bản & tên văn bản
            doc_type  = detect_doc_type(filename, cleaned_text)
            doc_title = extract_doc_title(cleaned_text)

            # Đưa vào ChromaDB kèm metadata trích dẫn đầy đủ (tên văn bản, số hiệu, số Điều)
            metadatas = build_article_metadata(filename, cleaned_text, documents, doc_type)
            rag_engine.add_documents(documents, metadatas, embed_texts=embed_texts)
            print(f"-> Đã index {len(documents)} chunk vào VectorDB (ChromaDB). [Văn bản: {doc_title or filename}]")

            # Lưu thông tin vào SQLite
            doc_record = LegalDocument(
                filename=filename,
                title=doc_title or None,
                doc_type=doc_type,
                article_count=len(documents)
            )
            db.add(doc_record)
            db.commit()
            print(f"-> Đã lưu metadata vào database SQLite thành công.")

        except Exception as e:
            db.rollback()
            print(f"-> Lỗi khi xử lý {filename}: {e}")

    db.close()
    print("\n=== Hoàn thành xử lý tất cả các file dữ liệu! ===")

if __name__ == "__main__":
    process_files()
