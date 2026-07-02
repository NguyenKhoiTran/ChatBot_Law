import React from 'react';
import { Link } from 'react-router-dom';
import { FaHandshake, FaLaptopCode, FaShieldAlt, FaBitcoin, FaRegComment } from 'react-icons/fa';
import WebHeader from '../components/web/WebHeader';
import WebFooter from '../components/web/WebFooter';
import Media from '../components/web/Media';

const articles = [
  {
    icon: <FaHandshake />,
    img: '/img/anninhmang/anm1.jpg',
    title: 'Việt Nam – Nhật Bản thúc đẩy hợp tác phòng thủ mạng',
    desc: 'Đại tướng Nguyễn Tân Cương đề nghị Nhật Bản tăng cường trao đổi chuyên gia, mở rộng đào tạo và tập huấn về phòng thủ mạng và nhiều lĩnh vực hợp tác quốc phòng khác giữa hai nước.',
  },
  {
    icon: <FaLaptopCode />,
    img: '/img/anninhmang/anm2.jpg',
    title: 'FPTU đào tạo ngành Khoa học máy tính theo mô hình cử nhân tài năng',
    desc: 'Chương trình Khoa học máy tính tại trường Đại học FPT (FPTU) chú trọng thực hành, đào tạo chuyên sâu về AI, dữ liệu và an ninh mạng, đáp ứng nhu cầu nhân lực công nghệ.',
  },
  {
    icon: <FaShieldAlt />,
    img: '/img/anninhmang/anm3.jpg',
    title: 'Xu hướng tinh gọn hệ thống bảo mật thời AI',
    desc: 'Nhiều tổ chức đang chuyển sang nền tảng bảo mật thống nhất, tích hợp AI nhằm giảm sự phức tạp, rời rạc, tăng hiệu quả xử lý rủi ro.',
  },
  {
    icon: <FaBitcoin />,
    img: '/img/anninhmang/anm4.jpg',
    title: 'Ba cựu công an chiếm đoạt tiền ảo của nghi phạm khi kiểm tra điện thoại',
    desc: 'Hà Nội – Tòa xác định cựu Phó Giám đốc Trung tâm 1 thuộc Cục An ninh mạng khi biết trong điện thoại của nghi phạm có tài khoản tiền ảo đã chỉ đạo cấp dưới chiếm đoạt, bán rồi chia tiền.',
  },
];

const popular = [
  { text: 'Quy định mới về bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP', count: 142 },
  { text: '10 hành vi bị nghiêm cấm theo Luật An ninh mạng 2018 (sửa đổi 2025)', count: 98 },
  { text: 'Mức xử phạt hành vi lừa đảo trên không gian mạng từ 01/7/2025', count: 156 },
  { text: 'Hướng dẫn tố giác tội phạm công nghệ cao qua Cổng dịch vụ công Bộ Công an', count: 87 },
  { text: 'Trách nhiệm pháp lý khi sử dụng AI tạo nội dung giả mạo', count: 121 },
];

const AnNinhMang = () => {
  return (
    <div className="min-h-screen flex flex-col font-body bg-surface text-svtext">
      <WebHeader logoSub="Nơi hội tụ và lan tỏa tri thức pháp luật" />

      <div className="max-w-[1180px] w-full mx-auto px-6">
        <div className="py-7 pb-4">
          <h1 className="font-serif text-[30px] font-bold text-navy uppercase tracking-wide">An Ninh Mạng</h1>
        </div>
      </div>

      <main className="max-w-[1180px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10 pb-15 items-start">
        {/* Danh sách bài viết */}
        <section>
          {articles.map((a, i) => (
            <article
              key={i}
              className="group flex flex-col sm:flex-row gap-5 py-6 border-b border-svline first:pt-1"
            >
              <Link to="#" className="block flex-shrink-0">
                <Media
                  icon={<span className="text-[28px]">{a.icon}</span>}
                  src={a.img}
                  alt={a.title}
                  className="w-full sm:w-[240px] h-[156px] rounded-lg"
                />
              </Link>
              <div className="pt-0.5">
                <Link to="#">
                  <h3 className="text-[20px] font-semibold text-navy leading-[1.35] mb-2.5 transition-colors group-hover:text-gold">
                    {a.title}
                  </h3>
                </Link>
                <p className="text-sm text-svtext-secondary leading-relaxed line-clamp-3">{a.desc}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Sidebar */}
        <aside>
          <div className="bg-surface-alt rounded-xl p-5 mb-6">
            <div className="text-base font-bold text-navy uppercase tracking-wide pb-3 mb-1.5 border-b-2 border-gold">
              Xem nhiều
            </div>
            {popular.map((p, i) => (
              <Link
                key={i}
                to="#"
                className="group flex gap-3 py-3.5 border-b border-svline last:border-none last:pb-0 items-start"
              >
                <p className="flex-1 text-[13.5px] text-svtext-secondary leading-snug transition-colors group-hover:text-gold">
                  {p.text}
                </p>
                <span className="flex items-center gap-1 text-gold-dark text-xs font-semibold whitespace-nowrap mt-0.5">
                  <FaRegComment /> {p.count}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </main>

      <WebFooter />
    </div>
  );
};

export default AnNinhMang;
