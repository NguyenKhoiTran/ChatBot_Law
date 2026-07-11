# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import auth, chat, documents

# Create all database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Law Chatbot API",
    description="Chatbot tư vấn pháp luật sử dụng RAG (Retrieval-Augmented Generation)",
    version="1.0.0",
    lifespan=lifespan
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    # Cho phép mọi origin localhost / 127.0.0.1 ở bất kỳ port nào (môi trường dev)
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Law Chatbot API is running"}

@app.get("/health", tags=["Root"])
async def health_check():
    return {"status": "healthy"}
