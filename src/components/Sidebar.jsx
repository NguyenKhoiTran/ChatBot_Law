import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaMessage, FaRegTrashCan, FaAnglesLeft, FaUser, FaRightFromBracket } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ConfirmDialog from './ConfirmDialog';
import ProfileDialog from './ProfileDialog';

const Sidebar = ({ isOpen = true, onToggle }) => {
  const { user, logout }                                          = useAuth();
  const { sessions, activeSessionId, loadSessions, selectSession, newChat, deleteSession } = useChat();

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // sessionId chờ xóa
  const [menuOpen, setMenuOpen]           = useState(false); // popup hồ sơ / đăng xuất
  const [profileOpen, setProfileOpen]     = useState(false); // hộp thoại chỉnh sửa hồ sơ
  const menuRef = useRef(null);

  // Hồ sơ cục bộ (lưu localStorage theo từng tài khoản, vì backend chưa hỗ trợ)
  const profileKey = user ? `profile:${user.username}` : null;
  const [profile, setProfile] = useState({ displayName: '', avatar: null });

  useEffect(() => {
    if (!profileKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(profileKey) || '{}');
      setProfile({ displayName: saved.displayName || '', avatar: saved.avatar || null });
    } catch {
      setProfile({ displayName: '', avatar: null });
    }
  }, [profileKey]);

  const saveProfile = ({ displayName, avatar }) => {
    const next = { displayName, avatar };
    setProfile(next);
    if (profileKey) localStorage.setItem(profileKey, JSON.stringify(next));
    setProfileOpen(false);
  };

  // Load sessions when sidebar mounts
  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleDelete = (e, sessionId) => {
    e.stopPropagation(); // prevent selecting deleted session
    setPendingDelete(sessionId);
  };

  return (
    <div
      className={`h-full bg-[#f7f7f8] border-r border-gray-200 flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
        isOpen ? 'w-64 border-r' : 'w-0 border-r-0'
      }`}
    >
      <div className="w-64 h-full flex flex-col">
        {/* Header: thu gọn + đoạn chat mới */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Lịch sử trò chuyện</span>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              title="Đóng thanh bên"
            >
              <FaAnglesLeft size={16} />
            </button>
          </div>
          <button
            id="new-chat-btn"
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full py-3 px-4 transition-colors duration-200 font-medium"
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
                ? 'bg-gray-200 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
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

      {/* User Info / Menu */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="relative" ref={menuRef}>
            {/* Popup hồ sơ / đăng xuất */}
            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1">
                <button
                  onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaUser className="text-gray-500" size={14} />
                  <span>Hồ sơ</span>
                </button>
                <button
                  id="logout-btn"
                  onClick={() => { setMenuOpen(false); setConfirmLogout(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-100 transition-colors"
                >
                  <FaRightFromBracket size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}

            {/* Nút mở menu (logo người dùng) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-3 rounded-lg p-1 hover:bg-gray-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : (profile.displayName || user.username)?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 truncate">{profile.displayName || user.username}</span>
            </button>
          </div>
        )}
      </div>

      {/* Chỉnh sửa hồ sơ */}
      <ProfileDialog
        open={profileOpen}
        username={user?.username}
        displayName={profile.displayName}
        avatar={profile.avatar}
        onSave={saveProfile}
        onCancel={() => setProfileOpen(false)}
      />

      {/* Xác nhận đăng xuất */}
      <ConfirmDialog
        open={confirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
        onConfirm={() => { setConfirmLogout(false); logout(); }}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* Xác nhận xóa cuộc trò chuyện */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?"
        confirmText="Xóa"
        onConfirm={async () => {
          await deleteSession(pendingDelete);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
      </div>
    </div>
  );
};

export default Sidebar;
