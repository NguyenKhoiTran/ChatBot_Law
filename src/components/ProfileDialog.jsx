import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera } from 'react-icons/fa6';

/**
 * Hộp thoại "Chỉnh sửa hồ sơ".
 *
 * Props:
 *  - open: boolean
 *  - username: string — tên đăng nhập (chỉ đọc)
 *  - displayName: string — tên hiển thị hiện tại
 *  - avatar: string|null — data URL ảnh đại diện hiện tại
 *  - onSave: ({ displayName, avatar }) => void
 *  - onCancel: () => void
 */
const ProfileDialog = ({ open, username, displayName, avatar, onSave, onCancel }) => {
  const [name, setName]           = useState(displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(avatar || null);
  const fileRef = useRef(null);

  // Đồng bộ lại giá trị mỗi khi mở hộp thoại
  useEffect(() => {
    if (open) {
      setName(displayName || '');
      setAvatarUrl(avatar || null);
    }
  }, [open, displayName, avatar]);

  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const initial = (name || username)?.[0]?.toUpperCase() || '?';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Chỉnh sửa hồ sơ</h3>

            {/* Ảnh đại diện */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : initial}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Đổi ảnh đại diện"
                >
                  <FaCamera size={13} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePickFile}
                />
              </div>
            </div>

            {/* Tên hiển thị */}
            <div className="relative mb-4">
              <label className="absolute -top-2 left-3 px-1 bg-white text-xs text-gray-500">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>

            {/* Tên người dùng (chỉ đọc) */}
            <div className="relative mb-3">
              <label className="absolute -top-2 left-3 px-1 bg-white text-xs text-gray-500">
                Tên người dùng
              </label>
              <input
                type="text"
                value={username || ''}
                disabled
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Hồ sơ của bạn giúp mọi người nhận ra bạn trong các cuộc trò chuyện nhóm.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => onSave({ displayName: name.trim(), avatar: avatarUrl })}
                className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
              >
                Lưu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDialog;
