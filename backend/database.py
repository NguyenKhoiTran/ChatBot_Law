from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Default to SQLite if no DATABASE_URL is provided
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./law_chatbot.db")

# SQLite requires different arguments for create_engine
if DATABASE_URL.startswith("sqlite"):
    # timeout=30: chờ tối đa 30s để lấy khóa ghi thay vì lỗi "database is locked" ngay
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 30},
    )

    # Bật WAL mode trên mỗi kết nối SQLite mới:
    #   - WAL cho phép NHIỀU reader đọc song song với MỘT writer (không chặn nhau),
    #     khắc phục lỗi "database is locked" khi vừa chat (ghi message) vừa thao tác khác.
    #   - busy_timeout: writer chờ tối đa 30s nếu DB đang bị khóa thay vì fail ngay.
    #   - synchronous=NORMAL: an toàn với WAL và nhanh hơn FULL.
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
