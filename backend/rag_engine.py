import chromadb
from chromadb.config import Settings
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
import os

class RAGEngine:
    def __init__(self, collection_name="legal_documents"):
        self.persist_directory = os.path.join(os.getcwd(), "chroma_db")
        self.embeddings = SentenceTransformerEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")
        
        self.vector_db = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory
        )

    def add_documents(self, texts, metadatas=None):
        """Add legal document chunks to the vector database."""
        self.vector_db.add_texts(texts=texts, metadatas=metadatas)
        self.vector_db.persist()

    def query(self, query_text, n_results=5):
        """Retrieve relevant legal documents."""
        results = self.vector_db.similarity_search(query_text, k=n_results)
        return results

# Initialize the engine
rag_engine = RAGEngine()
