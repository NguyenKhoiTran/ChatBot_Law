import React from 'react';
import { Link } from 'react-router-dom';
import { FaSchool, FaBookOpen, FaAward, FaPalette } from 'react-icons/fa';
import WebHeader from '../components/web/WebHeader';
import WebFooter from '../components/web/WebFooter';
import Media from '../components/web/Media';

const cards = [
  {
    icon: <FaBookOpen />,
    img: '/img/giaoduc/gd2.jpg',
    title: 'ĐH Quốc gia Hà Nội tuyển hơn 22.000 sinh viên, học phí từ 17,9 triệu đồng',
  },
  {
    icon: <FaAward />,
    img: '/img/giaoduc/gd3.jpg',
    title: 'Thủ khoa lớp 10 đạt điểm tuyệt đối Toán, Văn, Anh',
  },
  {
    icon: <FaPalette />,
    img: '/img/giaoduc/gd4.jpg',
    title: '9x được giải quảng cáo Mỹ nhờ bản sắc Việt',
    desc: 'Hồ Gia Hoàng đưa chất liệu từ tranh dân gian "Vinh Hoa" vào đồ án tốt nghiệp Thạc sĩ Quảng cáo sáng tạo.',
  },
];

const GiaoDuc = () => {
  return (
    <div className="min-h-screen flex flex-col font-body bg-surface text-svtext">
      <WebHeader logoSub="Nơi hội tụ và lan tỏa tri thức pháp luật" />

      <div className="max-w-[1180px] w-full mx-auto px-6">
        <div className="py-7 pb-3.5 border-b border-svline mb-6">
          <h1 className="font-serif text-[30px] font-bold text-navy">Giáo dục</h1>
        </div>
      </div>

      <main className="max-w-[1180px] w-full mx-auto px-6 pb-14">
        {/* Featured */}
        <Link
          to="#"
          className="group grid grid-cols-1 md:grid-cols-[1.3fr_1fr] bg-surface-alt rounded-xl overflow-hidden mb-9 transition-shadow hover:shadow-[0_10px_28px_rgba(13,27,42,0.12)]"
        >
          <Media
            icon={<FaSchool className="text-[30px]" />}
            src="/img/giaoduc/gd1.jpg"
            alt="Thi vào lớp 6 trường Trần Đại Nghĩa"
            className="min-h-[320px]"
          />
          <div className="p-[30px] flex flex-col justify-center">
            <h2 className="font-serif text-[26px] font-bold text-navy leading-tight mb-3.5 transition-colors group-hover:text-gold-dark">
              '1 chọi 12' vào lớp 6 trường Trần Đại Nghĩa
            </h2>
            <p className="text-[14.5px] text-svtext-secondary leading-relaxed">
              <span className="text-gold-dark font-semibold">TP HCM</span> – Tỷ lệ chọi vào lớp 6
              trường liên cấp Trần Đại Nghĩa giảm so với năm ngoái, trung bình 12 em thi có một em đỗ.
            </p>
          </div>
        </Link>

        {/* Card row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[26px]">
          {cards.map((c, i) => (
            <Link key={i} to="#" className="group block">
              <Media
                icon={<span className="text-2xl">{c.icon}</span>}
                src={c.img}
                alt={c.title}
                className="h-[190px] rounded-[10px] mb-3.5"
              />
              <h3 className="font-serif text-[18px] font-bold text-navy leading-snug transition-colors group-hover:text-gold-dark">
                {c.title}
              </h3>
              {c.desc && (
                <p className="mt-2 text-[13.5px] text-svtext-secondary leading-relaxed line-clamp-3">{c.desc}</p>
              )}
            </Link>
          ))}
        </div>
      </main>

      <WebFooter />
    </div>
  );
};

export default GiaoDuc;
