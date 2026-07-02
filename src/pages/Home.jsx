import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaCar, FaShieldAlt, FaGraduationCap, FaIndustry } from 'react-icons/fa';
import WebHeader from '../components/web/WebHeader';
import WebFooter from '../components/web/WebFooter';

const categories = [
  { to: '/giao-thong', icon: FaCar, title: 'Giao Thông', desc: 'Giao thông đường bộ' },
  { to: '/an-ninh-mang', icon: FaShieldAlt, title: 'An Ninh Mạng', desc: 'Dữ liệu cá nhân & nghĩa vụ số' },
  { to: '/giao-duc', icon: FaGraduationCap, title: 'Giáo Dục', desc: 'Giáo dục, học tập' },
  { to: '/lao-dong', icon: FaIndustry, title: 'Lao động', desc: 'Lao động Việt Nam' },
];

const cardClass =
  'bg-surface border border-svborder rounded-[14px] p-5 transition-all shadow-[0_2px_10px_rgba(13,27,42,0.05)] hover:bg-gold/6 hover:border-gold/40 hover:-translate-y-[3px] hover:shadow-[0_8px_22px_rgba(13,27,42,0.1)]';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col font-body bg-cream text-svtext">
      <WebHeader showNav logoSub="Nền tảng pháp luật Việt Nam" />

      {/* HERO */}
      <section className="relative flex items-center overflow-hidden min-h-[520px] bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-surface)_100%)]">
        {/* Lưới mờ bên phải */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(184,134,11,0.05) 48px, rgba(184,134,11,0.05) 49px), repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(184,134,11,0.05) 48px, rgba(184,134,11,0.05) 49px)',
          }}
        />
        <div className="absolute right-[5%] top-1/2 -translate-y-1/2 text-[200px] opacity-[0.08] text-gold pointer-events-none select-none">
          ⚖
        </div>

        <div className="relative w-full max-w-[1200px] mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-15 items-center">
          {/* Trái */}
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/12 border border-gold/30 text-gold-dark text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-5">
              <FaStar className="text-[10px]" />
              Nền tảng pháp luật Việt Nam
            </div>
            <h1 className="font-serif text-[48px] font-bold text-navy leading-[1.2] mb-5">
              Hiểu Luật
              <br />
              Sống Tự Tin
              <br />
              Hơn Mỗi Ngày
            </h1>
            <p className="text-svtext-secondary text-[15px] mb-8 max-w-[420px]">
              Tra cứu luật pháp, tìm hiểu quyền lợi và nghĩa vụ của bạn một cách dễ dàng, ngôn ngữ dễ
              hiểu dành cho người Việt Nam.
            </p>
            <Link
              to="/hoi-dap"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-gold to-gold-dark text-white text-sm font-semibold px-6 py-3 rounded-lg shadow-[0_4px_14px_rgba(184,134,11,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Bắt đầu hỏi đáp →
            </Link>
          </div>

          {/* Phải - lưới thẻ */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/hoi-dap" className={`${cardClass} col-span-2 flex items-center gap-4`}>
              <div className="w-[46px] h-[46px] bg-gold/15 rounded-[10px] flex items-center justify-center text-gold text-xl flex-shrink-0">
                <FaStar />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-svtext mb-1">Hỏi đáp pháp luật cùng AI</h4>
                <p className="text-[11.5px] text-svtext-muted leading-relaxed">Đặt câu hỏi, nhận trả lời ngay</p>
              </div>
            </Link>

            {categories.map(({ to, icon: Icon, title, desc }) => (
              <Link key={to} to={to} className={cardClass}>
                <div className="w-[46px] h-[46px] bg-gold/15 rounded-[10px] flex items-center justify-center text-gold text-xl mb-3">
                  <Icon />
                </div>
                <h4 className="text-[13px] font-semibold text-svtext mb-1">{title}</h4>
                <p className="text-[11.5px] text-svtext-muted leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WebFooter />
    </div>
  );
};

export default Home;
