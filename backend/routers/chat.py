import json
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import ChatSession, Message, User
from ..schemas import ChatRequest, ChatResponse, SessionOut, MessageOut
from ..rag_engine import rag_engine, HISTORY_TURNS
from ..routers.auth import get_current_user

router = APIRouter()


@router.post("/ask", response_model=ChatResponse)
async def ask(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Luồng RAG chính:
    1. Tạo session mới (nếu chưa có)
    2. Lưu câu hỏi của user
    3. Gọi RAG engine → retrieve + generate
    4. Lưu câu trả lời + sources
    5. Trả về response
    """
    # 1. Lấy hoặc tạo session
    if body.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == body.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session không tồn tại")
    else:
        title = body.question[:60] + "..." if len(body.question) > 60 else body.question
        session = ChatSession(user_id=current_user.id, title=title)
        db.add(session)
        db.flush()  # gán id cho session (chưa commit)

    # 2. Lấy lịch sử hội thoại (TRƯỚC câu hỏi mới) để hỗ trợ ngữ cảnh multi-turn
    history = []
    if body.session_id:
        prev_msgs = (
            db.query(Message)
            .filter(Message.session_id == session.id)
            .order_by(Message.id.asc())
            .all()
        )
        history = [
            {"role": m.role, "content": m.content}
            for m in prev_msgs[-HISTORY_TURNS:]
        ]

    # 3. Lưu câu hỏi user và COMMIT NGAY để nhả khóa ghi SQLite TRƯỚC khi gọi LLM.
    #    Quan trọng: SQLite chỉ cho 1 writer; nếu giữ transaction mở suốt lời gọi
    #    rag_engine.query() (LLM chạy nhiều giây), request song song sẽ chờ khóa quá
    #    busy_timeout rồi báo "database is locked". Commit ở đây → khóa chỉ bị giữ vài ms.
    user_msg = Message(session_id=session.id, role="user", content=body.question)
    db.add(user_msg)
    session_id = session.id  # lấy trước khi commit làm hết hạn (expire) thuộc tính
    db.commit()

    # 4. RAG: retrieve + generate (KHÔNG giữ transaction ghi nào ở bước chậm này)
    result = await rag_engine.query(body.question, history)

    # 5. Lưu câu trả lời assistant trong một transaction mới
    assistant_msg = Message(
        session_id=session_id,
        role="assistant",
        content=result["answer"],
        sources=json.dumps(result["sources"], ensure_ascii=False)
    )
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(
        session_id=session_id,
        answer=result["answer"],
        sources=result["sources"]
    )


@router.get("/sessions", response_model=List[SessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy danh sách lịch sử cuộc trò chuyện."""
    return db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()


@router.get("/sessions/{session_id}/messages", response_model=List[MessageOut])
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy toàn bộ tin nhắn trong một session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    return session.messages


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Xóa một phiên trò chuyện."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    db.delete(session)
    db.commit()
