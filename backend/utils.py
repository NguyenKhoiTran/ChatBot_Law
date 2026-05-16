import re
from docx import Document
from PyPDF2 import PdfReader
import io

def extract_text_from_pdf(file_bytes):
    pdf = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_bytes):
    doc = Document(io.BytesIO(file_bytes))
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text

def clean_legal_text(text):
    # Remove excessive newlines
    text = re.sub(r'\n\s*\n', '\n\n', text)
    # Remove multiple spaces
    text = re.sub(r' +', ' ', text)
    # Ensure "Điều X." is on a new line
    text = re.sub(r'([^\n])(Điều \d+\.)', r'\1\n\2', text)
    return text.strip()

def split_into_articles(text):
    """
    Splits legal text into individual articles based on 'Điều X.' pattern.
    """
    articles = re.split(r'\n(?=Điều \d+\.)', text)
    return [a.strip() for a in articles if a.strip()]
