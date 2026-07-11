"""
Re-index toàn bộ dữ liệu trong raw_data với metadata trích dẫn mới
(tên văn bản + số hiệu + số Điều), để chatbot tham chiếu đúng nguồn đã xử lý.

Cách dùng (từ thư mục gốc dự án):
    python -m backend.reindex_data

Script sẽ:
  1. Xóa sạch collection 'legal_documents' trong ChromaDB (vector cũ thiếu metadata)
  2. Xóa các bản ghi LegalDocument trong SQLite
  3. Chạy lại process_files() để index lại với metadata đầy đủ
"""

import sys
import os

workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if workspace_dir not in sys.path:
    sys.path.insert(0, workspace_dir)

from backend.rag_engine import rag_engine
from backend.database import SessionLocal, engine, Base
from backend.models import LegalDocument
from backend.process_local_files import process_files


def reset_index():
    print("=== BẮT ĐẦU RE-INDEX DỮ LIỆU ===\n")

    # 1. Xóa sạch nội dung collection TẠI CHỖ (giữ nguyên collection UUID).
    #    Không dùng delete_collection + tạo mới vì cách đó để lại thư mục segment
    #    "orphan" trong chroma_db/ và làm hỏng handle của tiến trình server đang chạy.
    vs = rag_engine.vector_store
    old_count = vs.count()
    print(f"[1/3] Xóa {old_count} vector cũ trong ChromaDB (reset tại chỗ)...")
    if old_count > 0:
        all_ids = vs.collection.get(include=[])["ids"]
        vs.collection.delete(ids=all_ids)
    print(f"      -> Collection còn {vs.count()} vector (đã rỗng).\n")

    # 2. Xóa metadata LegalDocument trong SQLite (để process_files xử lý lại từ đầu)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    deleted = db.query(LegalDocument).delete()
    db.commit()
    db.close()
    print(f"[2/3] Đã xóa {deleted} bản ghi LegalDocument trong SQLite.\n")

    # 3. Index lại toàn bộ
    print("[3/3] Index lại toàn bộ raw_data với metadata trích dẫn mới...\n")
    process_files()

    print(f"\n=== HOÀN TẤT. Tổng vector hiện có: {rag_engine.vector_store.count()} ===")
    print("LƯU Ý: Hãy KHỞI ĐỘNG LẠI backend (uvicorn) để server nạp dữ liệu mới — "
          "server đang chạy vẫn giữ collection cũ trong bộ nhớ.")


if __name__ == "__main__":
    reset_index()
