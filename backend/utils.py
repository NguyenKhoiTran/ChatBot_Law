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

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Chia nhỏ văn bản (Chunking) theo kích thước ký tự với một đoạn gối lên nhau (overlap)."""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        
        # Nếu chưa đến cuối văn bản, cố gắng cắt ở một ký tự ngắt dòng hoặc dấu chấm để tránh cắt ngang câu
        if end < len(text):
            # Tìm dấu ngắt đoạn hoặc ngắt câu gần nhất trong khoảng 100 ký tự cuối của chunk
            split_point = max(
                text.rfind('\n', start, end),
                text.rfind('. ', start, end)
            )
            if split_point != -1 and split_point > start + chunk_size // 2:
                end = split_point + 1 # Include the newline or period
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
            
        start = end - overlap # Lùi lại một chút để tạo overlap

    return chunks

_KHOAN_RE = re.compile(r'^\d+\.\s')                                  # khoản: "1. ", "10. "...
_ITEM_RE  = re.compile(r'^([a-zđôơưăâê])\)\s', re.IGNORECASE)        # điểm:  "a) ", "đ) "...

# Boilerplate ở tiêu đề các Điều xử phạt giao thông lặp gần như y hệt nhau giữa
# các loại xe, chỉ khác LOẠI XE/ĐỐI TƯỢNG. Nếu embed điểm a/b/c bỏ hẳn tiêu đề
# thì mất luôn tín hiệu loại xe, khiến "xe máy vượt đèn đỏ" và "xe đạp vượt đèn
# đỏ" có vector gần như trùng nhau -> retrieve nhầm điều của loại xe khác. Ta
# rút gọn tiêu đề thành "chủ thể" (loại xe/đối tượng) để chèn vào embed làm tín
# hiệu phân biệt, nhưng KHÔNG kèm cả câu boilerplate dài (sẽ lại nhấn chìm hành vi).
_TITLE_LEAD_RE = re.compile(
    r'^Điều\s+\d+[a-zA-Z]*\.\s*'
    r'(?:xử\s+phạt.*?người\s+điều\s+khiển\s+)?',
    re.IGNORECASE,
)
_TITLE_TAIL_RE = re.compile(
    r'\s*(?:,?\s*(?:và\s+)?các\s+loại\s+xe\s+tương\s+tự.*'
    r'|vi\s+phạm\s+quy\s+tắc.*)$',
    re.IGNORECASE,
)


def _subject_hint(title_line: str, max_len: int = 80) -> str:
    """Rút gọn tiêu đề Điều thành cụm chủ thể ngắn (loại xe/đối tượng) để chèn
    vào embed của từng điểm, khôi phục tín hiệu phân biệt mà không kéo theo cả
    câu boilerplate dài. Trả về '' nếu tiêu đề không có chủ thể đáng kể."""
    s = (title_line or "").strip()
    s = _TITLE_LEAD_RE.sub('', s)
    s = _TITLE_TAIL_RE.sub('', s)
    s = s.strip(' .,;')
    return s[:max_len].rstrip(' .,;') if s else ""


def _split_khoan_into_items(khoan_lines: list[str]) -> tuple[str, list[str]]:
    """Tách một khoản thành (phần đầu khoản trước điểm a, danh sách các điểm a/b/c...)."""
    lead: list[str] = []
    items: list[str] = []
    current: list[str] | None = None
    for ln in khoan_lines:
        if _ITEM_RE.match(ln.strip()):
            if current is not None:
                items.append('\n'.join(current))
            current = [ln]
        elif current is None:
            lead.append(ln)
        else:
            current.append(ln)
    if current is not None:
        items.append('\n'.join(current))
    return '\n'.join(lead).strip(), items


def _split_lines_into_khoans(part: str) -> tuple[str, list[list[str]]]:
    """Tách phần thân một Điều thành (dòng tiêu đề Điều, danh sách các khoản theo dòng)."""
    header_lines: list[str] = []
    khoans: list[list[str]] = []
    current: list[str] | None = None
    for ln in part.split('\n'):
        if _KHOAN_RE.match(ln.strip()):
            if current is not None:
                khoans.append(current)
            current = [ln]
        elif current is None:
            header_lines.append(ln)
        else:
            current.append(ln)
    if current is not None:
        khoans.append(current)
    return '\n'.join(header_lines).strip(), khoans


def split_into_articles(text: str, max_chunk_size: int = 900) -> list[dict]:
    """
    Tách văn bản thành các chunk theo mô hình 'EMBED NHỎ – LƯU LỚN'. Mỗi chunk là
    một dict {'document', 'embed'}:

      - document: văn bản ĐẦY ĐỦ (tiêu đề Điều + tiêu đề mức phạt của khoản + nội
        dung điểm). Đây là phần LƯU vào ChromaDB và đưa cho LLM, để mức phạt luôn
        đi kèm hành vi vi phạm tương ứng (tránh trả lời sai/thiếu).

      - embed: văn bản CÔ ĐỌNG dùng để TẠO VECTOR. Với các điểm liệt kê hành vi
        (a, b, c...) ta chỉ embed riêng nội dung điểm, KHÔNG kèm tiêu đề Điều — vì
        tiêu đề boilerplate ('Xử phạt... người điều khiển xe ô tô...') lặp ở mọi
        điều sẽ nhấn chìm tín hiệu của hành vi cụ thể, khiến retrieve sai. Với văn
        xuôi, embed kèm tiêu đề vì tiêu đề ('Tuổi nghỉ hưu') là tín hiệu hữu ích.
    """
    parts = re.split(r'\n(?=Điều\s+\d+\.)', text)
    chunks: list[dict] = []

    def add(document: str, embed: str) -> None:
        document = (document or "").strip()
        embed = (embed or "").strip() or document
        if document:
            chunks.append({"document": document, "embed": embed})

    for part in parts:
        part = part.strip()
        if not part:
            continue

        match = re.match(r'^(Điều\s+\d+[a-zA-Z]*\.)', part)
        if not match:
            # Đoạn không phải Điều (ví dụ: Lời nói đầu)
            if len(part) > max_chunk_size:
                for pc in chunk_text(part, chunk_size=max_chunk_size, overlap=150):
                    add(pc, pc)
            else:
                add(part, part)
            continue

        article_title = match.group(1)
        title_line, khoans = _split_lines_into_khoans(part)

        # Điều ngắn / không có khoản -> giữ nguyên cả Điều (tiêu đề là tín hiệu tốt)
        if not khoans:
            if len(part) <= max_chunk_size:
                add(part, part)
            else:
                pieces = chunk_text(part, chunk_size=max_chunk_size, overlap=120)
                for i, pc in enumerate(pieces):
                    add(pc if i == 0 else f"{article_title} (tiếp theo). {pc}", pc)
            continue

        for kh_lines in khoans:
            lead_text, items = _split_khoan_into_items(kh_lines)

            if not items:
                # Khoản văn xuôi (không có điểm) -> 1 chunk; embed kèm tiêu đề Điều
                document = f"{title_line}\n{lead_text}" if title_line else lead_text
                if len(document) <= max_chunk_size:
                    add(document, document)
                else:
                    pieces = chunk_text(lead_text, chunk_size=max_chunk_size, overlap=120)
                    for i, pc in enumerate(pieces):
                        doc = f"{title_line}\n{pc}" if title_line else pc
                        add(doc, doc if i == 0 else pc)
                continue

            # Khoản có các điểm -> MỖI ĐIỂM là 1 chunk:
            #   document = tiêu đề Điều + đầu khoản (mức phạt) + điểm  (đủ ngữ cảnh trả lời)
            #   embed    = chủ thể (loại xe) + nội dung điểm           (sạch + phân biệt được loại xe)
            subject = _subject_hint(title_line)
            for item in items:
                document = '\n'.join(p for p in (title_line, lead_text, item) if p)
                embed = f"{subject}. {item}" if subject else item
                add(document, embed)

    return chunks


# ─── Citation / Reference Extraction ──────────────────────────────────────────

def _titlecase_vi(s: str) -> str:
    """Đưa chuỗi IN HOA của tiêu đề văn bản về dạng đọc được (chữ thường, viết hoa đầu)."""
    s = re.sub(r'\s+', ' ', s).strip().lower()
    return s[:1].upper() + s[1:] if s else s


def parse_doc_number(filename: str) -> str:
    """
    Suy ra số hiệu văn bản từ tên file.
    Ví dụ: '36_2024_QH15.docx'   -> '36/2024/QH15'
           '168_2024_ND-CP.docx' -> '168/2024/NĐ-CP'
           '10_2016_TT-BGDDT.docx' -> '10/2016/TT-BGDĐT'
           'HienPhap.docx'        -> '' (không có số hiệu)
    """
    stem = os.path.splitext(os.path.basename(filename))[0]
    m = re.match(r'^(\d+)[_-](\d{4})[_-](.+)$', stem)
    if not m:
        return ""
    number, year, suffix = m.group(1), m.group(2), m.group(3).replace('_', '-')
    # Khôi phục dấu tiếng Việt cho các ký hiệu cơ quan ban hành thường gặp
    suffix = suffix.replace("ND-CP", "NĐ-CP").replace("TT-BGDDT", "TT-BGDĐT") \
                   .replace("QD-BGDDT", "QĐ-BGDĐT").replace("QD", "QĐ")
    return f"{number}/{year}/{suffix}"


def extract_doc_title(text: str) -> str:
    """
    Trích tên văn bản pháp luật từ phần đầu văn bản đã làm sạch.
    Ví dụ -> 'Luật Trật tự, an toàn giao thông đường bộ'
    """
    stop_starts = (
        "căn cứ", "theo đề nghị", "quốc hội ban hành", "chính phủ ban hành",
        "bộ trưởng", "chính phủ", "thủ tướng", "nghị định này", "luật này",
        "thông tư này", "lời nói đầu", "chương", "mục", "phần", "điều ",
    )
    title_lines: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        low = line.lower()
        if any(low.startswith(s) for s in stop_starts):
            break
        title_lines.append(line)
        if len(title_lines) >= 4:   # tiêu đề hiếm khi dài quá 4 dòng
            break

    title = " ".join(title_lines)
    # Loại bỏ đoạn "(CỦA <cơ quan>) SỐ .../... NGÀY .. THÁNG .. NĂM ...." lồng trong tiêu đề
    # (định dạng văn bản cũ), giữ lại phần mô tả nội dung ở trước và sau.
    title = re.sub(
        r'\s*(CỦA\s+.*?\s+)?SỐ\s+[\w/.\-Đ]+\s+NGÀY\s+\d+\s+THÁNG\s+\d+\s+NĂM\s+\d+\s*',
        ' ', title, flags=re.IGNORECASE,
    )
    return _titlecase_vi(title)


def extract_article_label(chunk: str, max_len: int = 90) -> str:
    """
    Lấy nhãn Điều luật từ một đoạn (chunk) đã tách.
    Ví dụ -> 'Điều 5. Tuyên truyền, phổ biến pháp luật về trật tự, an toàn...'
    Trả về '' nếu đoạn không bắt đầu bằng 'Điều X.' (ví dụ Lời nói đầu).
    """
    chunk = chunk.strip()
    # Chunk nối tiếp (điều luật dài bị chia nhỏ): chỉ giữ "Điều N (tiếp theo)", bỏ đoạn cắt dở.
    cont = re.match(r'^(Điều\s+\d+[a-zA-Z]*)\.\s*\(tiếp theo\)', chunk)
    if cont:
        return f"{cont.group(1)} (tiếp theo)"

    m = re.match(r'^(Điều\s+\d+[a-zA-Z]*\.)\s*([^\n]*)', chunk)
    if not m:
        return ""
    label = f"{m.group(1)} {m.group(2)}".strip()
    return label[:max_len].rstrip() + "…" if len(label) > max_len else label


def build_citation(doc_title: str, doc_number: str, article_label: str) -> str:
    """Ghép thành một trích dẫn căn cứ pháp lý hoàn chỉnh, đọc được."""
    head = doc_title or "Văn bản pháp luật"
    if doc_number:
        head = f"{head} số {doc_number}"
    return f"{head} — {article_label}" if article_label else head


def build_article_metadata(filename: str, cleaned_text: str, articles: list[str],
                           doc_type: str) -> list[dict]:
    """Tạo metadata chuẩn (đầy đủ trích dẫn) cho từng điều luật trước khi nạp vào ChromaDB."""
    doc_title  = extract_doc_title(cleaned_text)
    doc_number = parse_doc_number(filename)
    metadatas = []
    for i, chunk in enumerate(articles):
        article_label = extract_article_label(chunk)
        metadatas.append({
            "source":        filename,
            "doc_title":     doc_title,
            "doc_number":    doc_number,
            "doc_type":      doc_type,
            "article":       article_label,
            "article_index": i,
            "citation":      build_citation(doc_title, doc_number, article_label),
        })
    return metadatas


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
