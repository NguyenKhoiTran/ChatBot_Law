import sys
import os

# Thêm thư mục hiện tại vào python path để tránh lỗi import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Base, User
from backend.auth import hash_password

def seed_default_user():
    # Đảm bảo các bảng đã được tạo
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Kiểm tra xem tài khoản đã tồn tại chưa
        default_username = "admin"
        default_email = "admin@example.com"
        default_password = "adminpassword123"
        
        user = db.query(User).filter(User.username == default_username).first()
        if not user:
            new_user = User(
                username=default_username,
                email=default_email,
                hashed_password=hash_password(default_password),
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print("=========================================")
            print("🎉 Khởi tạo tài khoản mặc định THÀNH CÔNG!")
            print(f"👤 Tài khoản: {default_username}")
            print(f"📧 Email: {default_email}")
            print(f"🔑 Mật khẩu: {default_password}")
            print("=========================================")
        else:
            print("ℹ️ Tài khoản mặc định 'admin' đã tồn tại từ trước.")
    except Exception as e:
        print(f"❌ Có lỗi xảy ra khi tạo tài khoản: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_default_user()
