import React from 'react';
import { FaPlus, FaMessage, FaRegTrashCan } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const chatHistory = [
    { id: 1, title: 'Hỏi về lỗi vượt đèn đỏ' },
    { id: 2, title: 'Quy chế học vụ năm 2024' },
    { id: 3, title: 'Luật lao động cho sinh viên part-time' },
  ];

  return (
    <div className="w-64 bg-[#17171a] h-full border-r border-gray-800 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 bg-[#2a2b32] hover:bg-gray-700 text-white rounded-full py-3 px-4 transition-colors duration-200 font-medium">
          <FaPlus />
          <span>Đoạn chat mới</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Gần đây</div>
        {chatHistory.map(chat => (
          <div key={chat.id} className="group flex items-center justify-between p-2 hover:bg-[#2a2b32] rounded-lg cursor-pointer transition-colors duration-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <FaMessage className="text-gray-400 flex-shrink-0" size={14} />
              <span className="text-sm text-gray-300 truncate">{chat.title}</span>
            </div>
            <button className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FaRegTrashCan size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* User Section / Bottom */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex flex-col space-y-2">
          <Link to="/login" className="text-sm text-center text-gray-400 hover:text-white transition-colors">
            Đăng xuất
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
