import os
# pyrefly: ignore [missing-import]
import jwt
# pyrefly: ignore [missing-import]
import bcrypt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
