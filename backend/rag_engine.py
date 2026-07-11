"""
RAG Engine — Luồng RAG đầy đủ cho chatbot luật:

1. INDEXING:  load file → extract text → clean → split theo Điều → embed → store in ChromaDB
2. RETRIEVAL: embed query → similarity search ChromaDB → top-K articles
3. GENERATION: build prompt (context + question) → call LLM → parse answer + sources
"""

import os
import re
import json
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import httpx

# ─── Config ──────────────────────────────────────────────────────────────────
CHROMA_DIR    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
EMBED_MODEL   = "paraphrase-multilingual-MiniLM-L12-v2"  # hỗ trợ tiếng Việt tốt
COLLECTION    = "legal_documents"
TOP_K         = 5
# Ngưỡng cosine similarity tối thiểu để coi một điều luật là "liên quan".
# Dưới ngưỡng này, kết quả retrieve bị loại để tránh nhồi điều luật lạc đề vào prompt.
SCORE_THRESHOLD   = float(os.getenv("RAG_SCORE_THRESHOLD", "0.7"))
HISTORY_TURNS     = 6      # số message gần nhất đưa vào ngữ cảnh hội thoại (multi-turn)
HISTORY_MAX_CHARS = 600    # cắt bớt mỗi message lịch sử để không vượt context window
OLLAMA_URL    = os.getenv("OLLAMA_URL", "http://localhost:11434")
LLM_MODEL     = os.getenv("LLM_MODEL", "qwen2.5:7b")          # chạy local qua Ollama
# Cửa sổ ngữ cảnh cho Ollama. Mặc định Ollama chỉ 2048 token — KHÔNG đủ cho
# system prompt + 5 điều luật + lịch sử, khiến Context bị cắt cụt và model trả
# lời "không tìm thấy" dù dữ liệu có. Đặt đủ lớn để chứa toàn bộ Context.
LLM_NUM_CTX   = int(os.getenv("LLM_NUM_CTX", "8192"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))   # thấp để bám sát văn bản
OPENAI_KEY    = os.getenv("OPENAI_API_KEY", "")                # nếu dùng OpenAI


# ─── Query Expansion (khẩu ngữ → thuật ngữ pháp luật) ─────────────────────────
# Người dân hỏi bằng khẩu ngữ ("vượt đèn đỏ") trong khi văn bản luật dùng thuật
# ngữ trang trọng ("không chấp hành hiệu lệnh của đèn tín hiệu giao thông").
# Khoảng cách này khiến vector tìm kiếm xếp sai hạng và bỏ sót điều luật đúng.
# Khi câu hỏi chứa một khẩu ngữ ở khóa, ta CHÈN thêm cụm thuật ngữ luật vào
# truy vấn dùng để embed (câu hỏi gốc hiển thị cho LLM giữ nguyên).
LEGAL_SYNONYMS: Dict[str, str] = {
    # Giao thông
    "vượt đèn đỏ":      "không chấp hành hiệu lệnh của đèn tín hiệu giao thông",
    "vượt đèn":         "không chấp hành hiệu lệnh của đèn tín hiệu giao thông",
    "nồng độ cồn":      "trong máu hoặc hơi thở có nồng độ cồn",
    "uống rượu lái xe": "trong máu hoặc hơi thở có nồng độ cồn điều khiển xe",
    "say xỉn":          "trong máu hoặc hơi thở có nồng độ cồn",
    "quá tốc độ":       "chạy quá tốc độ quy định",
    "chạy nhanh":       "chạy quá tốc độ quy định",
    "lấn làn":          "đi không đúng phần đường, làn đường quy định",
    "sai làn":          "đi không đúng phần đường, làn đường quy định",
    "đi ngược chiều":   "đi ngược chiều của đường một chiều",
    "mũ bảo hiểm":      "không đội mũ bảo hiểm cho người đi mô tô, xe máy đội mũ bảo hiểm không cài quai đúng quy cách",
    "nón bảo hiểm":     "không đội mũ bảo hiểm cho người đi mô tô, xe máy",
    "bằng lái":         "giấy phép lái xe",
    "đua xe":           "đua xe trái phép",
    # Lao động
    "nghỉ hưu":         "tuổi nghỉ hưu",
    "về hưu":           "tuổi nghỉ hưu hưởng lương hưu",
    "sa thải":          "kỷ luật sa thải",
    "đuổi việc":        "kỷ luật sa thải đơn phương chấm dứt hợp đồng lao động",
    "tăng ca":          "làm thêm giờ",
    "làm thêm giờ":     "làm thêm giờ thời giờ làm việc",
    "nghỉ phép":        "nghỉ hằng năm",
    "thai sản":         "nghỉ thai sản",
    "lương tối thiểu":  "mức lương tối thiểu",
    # An ninh mạng
    "tin giả":          "thông tin sai sự thật trên không gian mạng",
    "tin sai sự thật":  "thông tin sai sự thật",
    # Hiến pháp / chung
    "quyền công dân":   "quyền và nghĩa vụ cơ bản của công dân",
}


def expand_legal_query(text: str) -> str:
    """Bổ sung thuật ngữ pháp luật tương ứng vào truy vấn để cải thiện retrieve."""
    low = text.lower()
    extra: List[str] = []
    for colloquial, legal in LEGAL_SYNONYMS.items():
        if colloquial in low and legal.lower() not in low and legal not in extra:
            extra.append(legal)
    return f"{text} {' '.join(extra)}" if extra else text


# ─── Phân biệt loại phương tiện / đối tượng (subject-aware re-ranking) ─────────
# Nhiều Điều xử phạt có tiêu đề & hành vi gần như giống hệt nhau, chỉ khác LOẠI
# PHƯƠNG TIỆN. Vector search hay xếp nhầm điều của loại xe khác lên trên (vd hỏi
# "xe máy vượt đèn đỏ" lại đẩy Điều xe đạp lên #1). Sau khi retrieve, ta nhận
# diện loại xe trong câu hỏi rồi CỘNG ĐIỂM cho điều luật đúng loại và TRỪ ĐIỂM
# điều luật của loại xe khác, để LLM nhận đúng căn cứ pháp lý.
VEHICLE_BOOST = float(os.getenv("RAG_VEHICLE_BOOST", "0.15"))

# Mỗi nhóm: 'query' = khóa nhận diện trong CÂU HỎI; 'title' = khóa nhận diện
# trong TIÊU ĐỀ Điều luật (metadata.article). Khớp theo ranh giới từ để tránh
# bắt nhầm (vd "mô tô" chứa chuỗi con "ô tô").
VEHICLE_GROUPS: Dict[str, Dict[str, List[str]]] = {
    "xe_may_chuyen_dung": {
        "query": ["xe máy chuyên dùng", "máy chuyên dùng", "xe chuyên dùng"],
        "title": ["chuyên dùng"],
    },
    "moto": {
        "query": ["xe máy", "xe gắn máy", "gắn máy", "xe mô tô", "mô tô", "moto"],
        "title": ["mô tô", "gắn máy"],
    },
    "oto": {
        "query": ["ô tô", "oto", "xe hơi", "xe con", "xe tải", "xe khách",
                  "xe đầu kéo", "container", "rơ moóc"],
        "title": ["ô tô"],
    },
    "xe_dap": {
        "query": ["xe đạp", "đạp điện", "đạp máy", "xe thô sơ", "thô sơ"],
        "title": ["xe đạp", "thô sơ"],
    },
    "nguoi_di_bo": {
        "query": ["người đi bộ", "đi bộ", "khách bộ hành"],
        "title": ["người đi bộ", "đi bộ"],
    },
}


def _kw_hit(text: str, kw: str) -> bool:
    """True nếu kw xuất hiện trong text theo ranh giới từ (không phải chuỗi con)."""
    return re.search(r'(?<!\w)' + re.escape(kw) + r'(?!\w)', text) is not None


def _vehicle_groups_in(text: str, field: str) -> set:
    """Tập các nhóm phương tiện khớp trong text (field = 'query' hoặc 'title')."""
    low = (text or "").lower()
    hits = {g for g, kws in VEHICLE_GROUPS.items() if any(_kw_hit(low, k) for k in kws[field])}
    # "xe máy chuyên dùng" chứa "xe máy" -> ưu tiên nhóm chuyên dùng, loại bỏ moto
    if "xe_may_chuyen_dung" in hits:
        hits.discard("moto")
    return hits


def rerank_by_vehicle(question: str, docs: List[Dict]) -> List[Dict]:
    """
    Sắp xếp lại kết quả retrieve theo loại phương tiện hỏi trong câu hỏi.
    Gán 'adj_score' = score ± VEHICLE_BOOST: cộng nếu điều luật đúng loại xe, trừ
    nếu là loại xe khác, giữ nguyên với điều luật chung (không gắn loại xe nào).
    Nếu câu hỏi không nhắc loại xe -> giữ nguyên thứ tự.
    """
    targets = _vehicle_groups_in(question, "query")
    for d in docs:
        d["adj_score"] = d["score"]
    if not targets:
        return docs
    for d in docs:
        doc_groups = _vehicle_groups_in(d["metadata"].get("article", ""), "title")
        if not doc_groups:
            continue                                  # điều luật chung -> giữ nguyên
        if doc_groups & targets:
            d["adj_score"] = d["score"] + VEHICLE_BOOST
        else:
            d["adj_score"] = d["score"] - VEHICLE_BOOST
    docs.sort(key=lambda d: d["adj_score"], reverse=True)
    return docs


# ─── Embedding ───────────────────────────────────────────────────────────────
class EmbeddingService:
    """Dịch vụ nhúng (embedding) văn bản thành vector."""

    def __init__(self):
        print(f"[EmbeddingService] Loading model: {EMBED_MODEL}")
        self.model = SentenceTransformer(EMBED_MODEL)
        # Mặc định model chỉ embed 128 token đầu -> cắt cụt chunk dài. Nâng lên 256
        # để bao phủ cả phần hành vi (a, b, c...) chứ không chỉ tiêu đề mức phạt.
        self.model.max_seq_length = 256

    def embed(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts, show_progress_bar=False).tolist()

    def embed_one(self, text: str) -> List[float]:
        return self.model.encode([text], show_progress_bar=False)[0].tolist()


# ─── Vector Store ─────────────────────────────────────────────────────────────
class VectorStore:
    """Wrapper ChromaDB — lưu trữ và truy vấn vector nhúng."""

    def __init__(self, embedding_service: EmbeddingService):
        self.embedder = embedding_service
        self.client = chromadb.PersistentClient(path=CHROMA_DIR)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION,
            metadata={"hnsw:space": "cosine"}
        )
        print(f"[VectorStore] Collection '{COLLECTION}' — {self.collection.count()} documents")

    def add_documents(self, texts: List[str], metadatas: List[Dict],
                      embed_texts: List[str] | None = None) -> int:
        """
        Thêm các đoạn văn bản luật vào ChromaDB.

        embed_texts: nếu được cung cấp, vector được tạo từ embed_texts (bản cô đọng
        để retrieve trúng hơn) trong khi documents lưu/đưa cho LLM vẫn là texts (bản
        đầy đủ). Đây là mô hình 'embed nhỏ – lưu lớn'. Mặc định embed chính texts.
        """
        if not texts:
            return 0
        embeddings = self.embedder.embed(embed_texts if embed_texts is not None else texts)
        # Generate unique IDs
        start_id = self.collection.count()
        ids = [f"doc_{start_id + i}" for i in range(len(texts))]
        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )
        return len(texts)

    def query(self, question: str, n_results: int = TOP_K) -> List[Dict[str, Any]]:
        """Truy vấn các điều luật liên quan nhất đến câu hỏi."""
        query_embedding = self.embedder.embed_one(question)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        docs      = results["documents"][0]
        metas     = results["metadatas"][0]
        distances = results["distances"][0]

        return [
            {
                "content":  docs[i],
                "metadata": metas[i],
                "score":    1 - distances[i]   # cosine similarity
            }
            for i in range(len(docs))
        ]

    def count(self) -> int:
        return self.collection.count()


# ─── LLM Service ─────────────────────────────────────────────────────────────
class LLMService:
    """Gọi LLM Ollama local để tạo câu trả lời."""

    SYSTEM_PROMPT = (
      "Bạn là trợ lý tư vấn pháp luật Việt Nam hoạt động theo mô hình RAG. "
      "Phần Context bên dưới chứa các điều luật đã được hệ thống truy xuất là LIÊN QUAN đến câu hỏi. "
      "Nhiệm vụ của bạn là ĐỌC KỸ toàn bộ Context và TRẢ LỜI câu hỏi dựa trên nội dung trong đó. "
      "Chỉ cần Context có quy định liên quan đến câu hỏi thì PHẢI trả lời; "
      "không được từ chối chỉ vì câu chữ không trùng khít với câu hỏi. "
      "Người dân hỏi bằng khẩu ngữ còn văn bản luật dùng thuật ngữ trang trọng — "
      "hãy chủ động ánh xạ chúng với nhau (ví dụ 'vượt đèn đỏ' chính là 'không chấp hành "
      "hiệu lệnh của đèn tín hiệu giao thông'; 'nồng độ cồn' là 'trong máu hoặc hơi thở có nồng độ cồn'). "
      "Khi trích dẫn, ghi rõ tên văn bản pháp luật và số Điều, Khoản đúng như xuất hiện trong Context. "
      "ĐẶC BIỆT chú ý LOẠI PHƯƠNG TIỆN / ĐỐI TƯỢNG mà câu hỏi nhắc tới "
      "(xe máy/xe mô tô/xe gắn máy, ô tô, xe đạp/xe thô sơ, xe máy chuyên dùng, người đi bộ...). "
      "Mỗi Điều xử phạt thường chỉ áp dụng cho MỘT loại phương tiện ghi ngay ở tiêu đề Điều. "
      "Chỉ được dùng điều luật dành ĐÚNG loại phương tiện trong câu hỏi; "
      "TUYỆT ĐỐI không lấy mức phạt của loại phương tiện khác (vd hỏi xe máy thì không trích Điều của xe đạp hay ô tô), "
      "kể cả khi điều luật đó cũng xuất hiện trong Context. "
      "Nếu Context có nhiều quy định liên quan, hãy tổng hợp đầy đủ và nêu rõ từng căn cứ pháp lý. "
      "Không bịa hoặc viện dẫn Điều, Khoản, Nghị định, Thông tư không có trong Context; "
      "không thêm con số (mức phạt, thời hạn, độ tuổi...) không xuất hiện trong Context. "
      "CHỈ khi toàn bộ Context hoàn toàn không nhắc gì đến vấn đề được hỏi, mới trả lời đúng một câu: "
      "'Tôi không tìm thấy quy định pháp luật phù hợp trong dữ liệu hiện có để trả lời câu hỏi này.' "
      "Hãy trả lời theo định dạng: "
      "'[Căn cứ pháp lý]' liệt kê Văn bản, Điều, Khoản; "
      "'[Trả lời]' trình bày nội dung được diễn giải từ căn cứ pháp lý. "
      
    )

    @staticmethod
    def _citation_of(meta: Dict) -> str:
        """Lấy trích dẫn căn cứ pháp lý đọc được từ metadata (có fallback cho dữ liệu cũ)."""
        if meta.get("citation"):
            return meta["citation"]
        # Fallback cho các tài liệu được index theo định dạng metadata cũ
        title  = meta.get("doc_title") or meta.get("source", "Văn bản pháp luật")
        number = meta.get("doc_number", "")
        head   = f"{title} số {number}" if number else title
        article = meta.get("article", "")
        return f"{head} — {article}" if article else head

    @staticmethod
    def _history_block(history: List[Dict]) -> str:
        """Định dạng lịch sử hội thoại gần nhất để LLM hiểu các câu hỏi nối tiếp."""
        if not history:
            return ""
        turns = []
        for m in history:
            role = "Người dùng" if m.get("role") == "user" else "Trợ lý"
            content = (m.get("content") or "").strip()
            if len(content) > HISTORY_MAX_CHARS:
                content = content[:HISTORY_MAX_CHARS] + "…"
            turns.append(f"{role}: {content}")
        return "Lịch sử hội thoại trước đó (chỉ để hiểu ngữ cảnh câu hỏi):\n" + "\n".join(turns) + "\n\n"

    def _build_prompt(self, question: str, contexts: List[Dict],
                      history: List[Dict] | None = None) -> str:
        context_block = "\n\n---\n\n".join(
            f"[Căn cứ pháp lý: {self._citation_of(c['metadata'])}]\n{c['content']}"
            for c in contexts
        )
        return (
            f"{self._history_block(history or [])}"
            f"Context:\n{context_block}\n\n"
            f"Câu hỏi hiện tại: {question}\n\n"
            f"Trả lời:"
        )

    async def generate_ollama(self, question: str, contexts: List[Dict],
                              history: List[Dict] | None = None) -> str:
        prompt = self._build_prompt(question, contexts, history)
        try:
            # Tắt giới hạn timeout (timeout=None) vì việc sinh text với context lớn trên CPU rất chậm
            async with httpx.AsyncClient(timeout=None) as client:
                resp = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={
                        "model":  LLM_MODEL,
                        "system": self.SYSTEM_PROMPT,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "num_ctx":     LLM_NUM_CTX,      # tránh cắt cụt Context
                            "temperature": LLM_TEMPERATURE,
                            "top_p":       0.9,
                        },
                    }
                )
                if resp.status_code == 404:
                    return f"Lỗi: Không tìm thấy mô hình '{LLM_MODEL}' trong Ollama. Vui lòng tải xuống mô hình bằng cách chạy lệnh `ollama pull {LLM_MODEL}` trong terminal."
                resp.raise_for_status()
                return resp.json()["response"].strip()
        except httpx.ConnectError:
            return "Lỗi: Không thể kết nối với Ollama. Vui lòng đảm bảo Ollama đang chạy tại địa chỉ http://localhost:11434."
        except httpx.ReadTimeout:
            return "Lỗi: LLM Ollama phản hồi quá chậm (Timeout). Vui lòng thử lại hoặc kiểm tra tài nguyên hệ thống."
        except httpx.HTTPStatusError as e:
            return f"Lỗi từ Ollama (Mã lỗi {e.response.status_code}): {e.response.text}"
        except Exception as e:
            import traceback
            traceback.print_exc()
            return f"Lỗi hệ thống khi gọi LLM Ollama: {repr(e)}"

    async def generate_openai(self, question: str, contexts: List[Dict],
                              history: List[Dict] | None = None) -> str:
        """Dự phòng: gọi OpenAI nếu có API key."""
        # pyrefly: ignore [missing-import]
        import openai
        openai.api_key = OPENAI_KEY
        prompt = self._build_prompt(question, contexts, history)
        response = await openai.AsyncOpenAI().chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user",   "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()

    async def generate(self, question: str, contexts: List[Dict],
                       history: List[Dict] | None = None) -> str:
        if OPENAI_KEY:
            return await self.generate_openai(question, contexts, history)
        return await self.generate_ollama(question, contexts, history)


# ─── RAG Engine (Orchestrator) ────────────────────────────────────────────────
class RAGEngine:
    """
    Điều phối toàn bộ luồng RAG:
       User Question
           │
           ▼
       [Embedding]   ← SentenceTransformer
           │
           ▼
       [ChromaDB Retrieval]  ← top-K articles (cosine similarity)
           │
           ▼
       [Prompt Build]  ← system prompt + context + question
           │
           ▼
       [LLM Generate]  ← Ollama / OpenAI
           │
           ▼
       Answer + Sources
    """

    def __init__(self):
        self.embedder     = EmbeddingService()
        self.vector_store = VectorStore(self.embedder)
        self.llm          = LLMService()

    # ── Indexing Phase ──────────────────────────────────────────────────────
    def add_documents(self, texts: List[str], metadatas: List[Dict],
                      embed_texts: List[str] | None = None) -> int:
        """Nạp các điều luật đã làm sạch vào ChromaDB (xem VectorStore.add_documents)."""
        return self.vector_store.add_documents(texts, metadatas, embed_texts)

    # ── Inference Phase ─────────────────────────────────────────────────────
    @staticmethod
    def _search_base(question: str, history: List[Dict]) -> str:
        """
        Ghép câu hỏi hiện tại với 1–2 câu hỏi gần nhất của người dùng để bù ngữ
        cảnh cho các câu hỏi nối tiếp (vd "Còn xe máy thì sao?"). Không dùng nội
        dung trả lời của trợ lý để tránh làm nhiễu vector truy vấn. CHƯA expand —
        dùng cho cả nhận diện loại phương tiện (tránh từ khóa lẫn vào synonym).
        """
        base = question
        if history:
            prev_user = [m["content"] for m in history if m.get("role") == "user"][-2:]
            if prev_user:
                base = " ".join(prev_user + [question])
        return base

    async def query(self, question: str,
                    history: List[Dict[str, str]] | None = None) -> Dict[str, Any]:
        """
        Luồng RAG hoàn chỉnh:
          1. Tạo truy vấn tìm kiếm có ngữ cảnh (hỗ trợ câu hỏi nối tiếp)
          2. Retrieve một pool ứng viên, RE-RANK theo loại phương tiện rồi lấy
             top-K và LỌC theo ngưỡng similarity
          3. Build prompt (kèm lịch sử) & gọi LLM
          4. Trả về answer + sources
        """
        history = history or []

        # Step 1: Truy vấn tìm kiếm có ngữ cảnh (base để rerank + bản expand để embed)
        base_query   = self._search_base(question, history)
        search_query = expand_legal_query(base_query)

        # Step 2: Retrieve pool rộng -> rerank theo loại xe -> lấy top-K -> lọc ngưỡng.
        # Lấy nhiều ứng viên hơn TOP_K để rerank có thể kéo điều luật ĐÚNG loại xe
        # (vốn bị xếp dưới) lên trên trước khi cắt.
        pool = max(TOP_K * 3, 12)
        retrieved = self.vector_store.query(search_query, n_results=pool)
        retrieved = rerank_by_vehicle(base_query, retrieved)
        relevant_docs = [d for d in retrieved
                         if d.get("adj_score", d["score"]) >= SCORE_THRESHOLD][:TOP_K]

        if not relevant_docs:
            return {
                "answer": "Tôi không tìm thấy quy định pháp luật phù hợp trong dữ liệu hiện có để trả lời câu hỏi này.",
                "sources": []
            }

        # Step 3: Generate (kèm lịch sử hội thoại)
        answer = await self.llm.generate(question, relevant_docs, history)

        # Step 4: Format sources — hiển thị đúng tên văn bản + số Điều đã xử lý
        sources = []
        for doc in relevant_docs:
            meta = doc["metadata"]
            title   = meta.get("doc_title") or meta.get("source", "Văn bản pháp luật")
            number  = meta.get("doc_number", "")
            article = meta.get("article", "") or (doc["content"][:120] + "…")
            sources.append({
                "source":  f"{title} ({number})" if number else title,
                "article": article,
                "score":   round(doc["score"], 4),
            })

        return {"answer": answer, "sources": sources}


# ─── Singleton ────────────────────────────────────────────────────────────────
rag_engine = RAGEngine()
