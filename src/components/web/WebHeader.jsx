import React from 'react';
import { Link } from 'react-router-dom';
import { FaBalanceScale, FaSearch } from 'react-icons/fa';

/**
 * Header dùng chung cho các trang web (landing/tin tức) theo phong cách SVLaw.
 *
 * @param {boolean} showNav   Hiện thanh nav + ô tìm kiếm (dùng cho trang chủ).
 * @param {string}  logoSub   Dòng phụ dưới tên SVLaw.
 */
const WebHeader = ({ showNav = false, logoSub = 'Nền tảng pháp luật Việt Nam' }) => {
  return (
    <header className="sticky top-0 z-100 bg-surface shadow-[0_1px_12px_rgba(13,27,42,0.06)] border-b border-svborder">
      <div className="max-w-[1200px] mx-auto flex items-center gap-7 px-8 h-[72px]">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white text-[22px] shadow-[0_2px_8px_rgba(184,134,11,0.35)]">
            <FaBalanceScale />
          </div>
          <div className="leading-tight">
            <span className="block font-serif text-[20px] font-bold text-gold tracking-wide">SVLaw</span>
            <span className="block text-[10px] text-svtext-muted tracking-wide">{logoSub}</span>
          </div>
        </Link>

        {showNav && (
          <>
            <nav className="flex items-center ml-auto">
              <Link
                to="/"
                className="text-[13.5px] font-medium text-svtext-secondary px-4 py-2 rounded-md transition-colors hover:text-gold hover:bg-gold/8"
              >
                Trang Chủ
              </Link>
              <Link
                to="/hoi-dap"
                className="text-[13.5px] font-medium text-svtext-secondary px-4 py-2 rounded-md transition-colors hover:text-gold hover:bg-gold/8"
              >
                Hỏi Đáp
              </Link>
            </nav>
            <div className="flex items-center gap-2 bg-surface-alt border border-svborder rounded-lg px-3.5 py-2">
              <FaSearch className="text-gold text-sm" />
              <input
                type="text"
                placeholder="Tìm kiếm luật..."
                className="bg-transparent border-none outline-none text-svtext text-[13px] w-[200px] placeholder:text-svtext-muted"
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default WebHeader;
