from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat ────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: Optional[int] = None   # None → create new session
    question: str

class SourceItem(BaseModel):
    article: str
    source: str

class ChatResponse(BaseModel):
    session_id: int
    answer: str
    sources: List[SourceItem]

class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Documents ───────────────────────────────────────────────────────────────
class DocumentOut(BaseModel):
    id: int
    filename: str
    title: Optional[str]
    doc_type: Optional[str]
    article_count: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
