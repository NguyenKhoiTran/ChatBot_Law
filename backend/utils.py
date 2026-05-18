import os
import re
import io
from docx import Document
from PyPDF2 import PdfReader


# ─── Text Extraction ──────────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Trích xuất văn bản từ file PDF."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Trích xuất văn bản từ file DOCX, giữ nguyên cấu trúc đoạn."""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    return "\n".join(paragraphs)


# ─── Text Cleaning ────────────────────────────────────────────────────────────

def clean_legal_text(text: str) -> str:
    """
    Làm sạch văn bản pháp luật:
    - Xóa khoảng trắng thừa
    - Chuẩn hóa ký tự xuống dòng
    - Đảm bảo mỗi 'Điều X.' bắt đầu dòng mới
    - Xóa header/footer trang (số trang, tên văn bản lặp lại)
    """
    # Chuẩn hóa unicode: loại bỏ ký tự không in được
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

    # Loại bỏ các dòng chỉ có số trang (thường là số đứng một mình)
    text = re.sub(r'^\s*\d{1,3}\s*$', '', text, flags=re.MULTILINE)

    # Chuẩn hóa dấu cách
    text = re.sub(r'[ \t]+', ' ', text)

    # Đảm bảo "Điều X." luôn bắt đầu dòng mới
    text = re.sub(r'([^\n])\s*(Điều\s+\d+\.)', r'\1\n\2', text)

    # Đảm bảo "Chương X", "Mục X" bắt đầu dòng mới
    text = re.sub(r'([^\n])\s*(Chương\s+[IVXLC\d]+)', r'\1\n\2', text)
    text = re.sub(r'([^\n])\s*(Mục\s+\d+)', r'\1\n\2', text)

    # Chuẩn hóa khoảng trắng giữa các dòng (tối đa 2 dòng trống liên tiếp)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


# ─── Article Splitting ────────────────────────────────────────────────────────

def split_into_articles(text: str) -> list[str]:
    """
    Tách văn bản thành từng Điều luật riêng biệt.
    Mẫu: 'Điều 1.', 'Điều 12.', 'Điều 123.'
    """
    # Tách theo từng Điều
    parts = re.split(r'\n(?=Điều\s+\d+\.)', text)
    articles = []
    for part in parts:
        part = part.strip()
        if part and re.match(r'^Điều\s+\d+\.', part):
            articles.append(part)
    return articles


def detect_doc_type(filename: str, text: str) -> str:
    """Phát hiện loại văn bản pháp luật từ tên file hoặc nội dung."""
    filename_lower = filename.lower()
    if "luật" in filename_lower or "luat" in filename_lower:
        return "Luật"
    if "nghị định" in filename_lower or "nghi_dinh" in filename_lower:
        return "Nghị định"
    if "thông tư" in filename_lower or "thong_tu" in filename_lower:
        return "Thông tư"
    if "quyết định" in filename_lower or "quyet_dinh" in filename_lower:
        return "Quyết định"
    # Phát hiện từ nội dung
    if re.search(r'LUẬT\s+[A-ZĐÀÁẢÃẠĂẮẶẰẲẴÂẤẬẦẨẪ]', text[:500]):
        return "Luật"
    return "Văn bản pháp luật"
