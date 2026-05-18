"""
RAG Engine — Luồng RAG đầy đủ cho chatbot luật:

1. INDEXING:  load file → extract text → clean → split theo Điều → embed → store in ChromaDB
2. RETRIEVAL: embed query → similarity search ChromaDB → top-K articles
3. GENERATION: build prompt (context + question) → call LLM → parse answer + sources
"""

import os
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
OLLAMA_URL    = os.getenv("OLLAMA_URL", "http://localhost:11434")
LLM_MODEL     = os.getenv("LLM_MODEL", "qwen2.5:7b")          # chạy local qua Ollama
OPENAI_KEY    = os.getenv("OPENAI_API_KEY", "")                # nếu dùng OpenAI


# ─── Embedding ───────────────────────────────────────────────────────────────
class EmbeddingService:
    """Dịch vụ nhúng (embedding) văn bản thành vector."""

    def __init__(self):
        print(f"[EmbeddingService] Loading model: {EMBED_MODEL}")
        self.model = SentenceTransformer(EMBED_MODEL)

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

    def add_documents(self, texts: List[str], metadatas: List[Dict]) -> int:
        """Thêm các đoạn văn bản luật vào ChromaDB."""
        if not texts:
            return 0
        embeddings = self.embedder.embed(texts)
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
    """Gọi LLM (Ollama local hoặc OpenAI) để tạo câu trả lời."""

    SYSTEM_PROMPT = (
        "Bạn là trợ lý tư vấn pháp luật chuyên nghiệp của Việt Nam. "
        "Chỉ trả lời dựa trên CÁC VĂN BẢN LUẬT được cung cấp trong phần Context. "
        "Khi trả lời, hãy trích dẫn rõ ràng số Điều, Khoản, tên văn bản pháp luật. "
        "Nếu Context không đủ thông tin, hãy thông báo thẳng thắn rằng bạn không tìm thấy "
        "quy định liên quan và đề xuất người dùng tham khảo luật sư. "
        "Không được bịa đặt hoặc suy đoán ngoài nội dung luật đã cung cấp."
    )

    def _build_prompt(self, question: str, contexts: List[Dict]) -> str:
        context_block = "\n\n---\n\n".join(
            f"[Nguồn: {c['metadata'].get('source', 'unknown')}]\n{c['content']}"
            for c in contexts
        )
        return (
            f"Context:\n{context_block}\n\n"
            f"Câu hỏi: {question}\n\n"
            f"Trả lời:"
        )

    async def generate_ollama(self, question: str, contexts: List[Dict]) -> str:
        prompt = self._build_prompt(question, contexts)
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model":  LLM_MODEL,
                    "system": self.SYSTEM_PROMPT,
                    "prompt": prompt,
                    "stream": False
                }
            )
            resp.raise_for_status()
            return resp.json()["response"].strip()

    async def generate_openai(self, question: str, contexts: List[Dict]) -> str:
        """Dự phòng: gọi OpenAI nếu có API key."""
        import openai
        openai.api_key = OPENAI_KEY
        prompt = self._build_prompt(question, contexts)
        response = await openai.AsyncOpenAI().chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user",   "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()

    async def generate(self, question: str, contexts: List[Dict]) -> str:
        if OPENAI_KEY:
            return await self.generate_openai(question, contexts)
        return await self.generate_ollama(question, contexts)


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
    def add_documents(self, texts: List[str], metadatas: List[Dict]) -> int:
        """Nạp các điều luật đã làm sạch vào ChromaDB."""
        return self.vector_store.add_documents(texts, metadatas)

    # ── Inference Phase ─────────────────────────────────────────────────────
    async def query(self, question: str) -> Dict[str, Any]:
        """
        Luồng RAG hoàn chỉnh:
          1. Embed câu hỏi
          2. Retrieve top-K từ ChromaDB
          3. Build prompt & gọi LLM
          4. Trả về answer + sources
        """
        # Step 1 + 2: Retrieve
        relevant_docs = self.vector_store.query(question, n_results=TOP_K)

        if not relevant_docs:
            return {
                "answer": "Không tìm thấy văn bản pháp luật liên quan trong cơ sở dữ liệu.",
                "sources": []
            }

        # Step 3: Generate
        answer = await self.llm.generate(question, relevant_docs)

        # Step 4: Format sources
        sources = [
            {
                "article": doc["content"][:200] + "...",
                "source":  doc["metadata"].get("source", "unknown"),
                "score":   round(doc["score"], 4)
            }
            for doc in relevant_docs
        ]

        return {"answer": answer, "sources": sources}


# ─── Singleton ────────────────────────────────────────────────────────────────
rag_engine = RAGEngine()
