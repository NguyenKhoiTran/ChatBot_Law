from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(100), unique=True, index=True, nullable=False)
    email           = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)

    sessions = relationship("ChatSession", back_populates="owner", cascade="all, delete-orphan")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(255), default="Cuộc trò chuyện mới")
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner    = relationship("User", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role       = Column(String(20), nullable=False)  # 'user' | 'assistant'
    content    = Column(Text, nullable=False)
    sources    = Column(Text, nullable=True)          # JSON list of source articles
    timestamp  = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id             = Column(Integer, primary_key=True, index=True)
    filename       = Column(String(255), nullable=False)
    title          = Column(String(500), nullable=True)
    doc_type       = Column(String(100), nullable=True)  # 'Luật', 'Nghị định', 'Thông tư'
    article_count  = Column(Integer, default=0)
    uploaded_at    = Column(DateTime, default=datetime.datetime.utcnow)
