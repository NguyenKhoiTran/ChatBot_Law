import React, { useEffect } from 'react';
import { FaPlus, FaMessage, FaRegTrashCan } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Sidebar = () => {
  const { user, logout }                                          = useAuth();
  const { sessions, activeSessionId, loadSessions, selectSession, newChat, deleteSession } = useChat();

  // Load sessions when sidebar mounts
  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); // prevent selecting deleted session
    if (confirm('Xóa cuộc trò chuyện này?')) {
      await deleteSession(sessionId);
    }
  };

  return (
    <div className="w-64 bg-[#17171a] h-full border-r border-gray-800 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          id="new-chat-btn"
          onClick={newChat}
          className="w-full flex items-center justify-center gap-2 bg-[#2a2b32] hover:bg-gray-700 text-white rounded-full py-3 px-4 transition-colors duration-200 font-medium"
        >
          <FaPlus />
          <span>Đoạn chat mới</span>
        </button>
      </div>

      {/* Session History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Gần đây</div>

        {sessions.length === 0 && (
          <p className="text-xs text-gray-600 px-2 py-4 text-center">Chưa có cuộc trò chuyện nào</p>
        )}

        {sessions.map(session => (
          <div
            key={session.id}
            onClick={() => selectSession(session.id)}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSessionId === session.id
                ? 'bg-[#3a3b42] text-white'
                : 'hover:bg-[#2a2b32] text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FaMessage className="text-gray-400 flex-shrink-0" size={14} />
              <span className="text-sm truncate">{session.title}</span>
            </div>
            <button
              onClick={(e) => handleDelete(e, session.id)}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
              title="Xóa cuộc trò chuyện"
            >
              <FaRegTrashCan size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* User Info / Logout */}
      <div className="p-4 border-t border-gray-800">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-300 truncate">{user.username}</span>
          </div>
        )}
        <button
          id="logout-btn"
          onClick={logout}
          className="w-full text-sm text-center text-gray-500 hover:text-red-400 transition-colors py-1"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
