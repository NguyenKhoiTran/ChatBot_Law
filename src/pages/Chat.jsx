import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa6';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-dark-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex flex-col relative">
        {/* Nút mở sidebar khi đang đóng */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-7 left-4 z-20 p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
            title="Mở thanh bên"
          >
            <FaBars size={18} />
          </button>
        )}
        <Header sidebarOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col justify-between items-center relative overflow-y-auto">
          <MainContent />
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default Chat;
