import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Header = ({ sidebarOpen = true }) => {
  return (
    <header className="w-full flex justify-between items-center p-6">
      <div
        className={`text-[28px] font-semibold text-gray-900 tracking-wide mt-2 transition-all ${
          sidebarOpen ? 'ml-4' : 'ml-14'
        }`}
      >
        Chatbot Law
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mr-2"
      >
        <FaArrowLeft size={12} />
        Trang chủ
      </Link>
    </header>
  );
};

export default Header;
