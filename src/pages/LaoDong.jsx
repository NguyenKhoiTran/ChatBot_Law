import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserTie, FaMobileAlt, FaSuitcaseRolling, FaLaptop, FaImage, FaCamera, FaRegComment } from 'react-icons/fa';
import WebHeader from '../components/web/WebHeader';
import WebFooter from '../components/web/WebFooter';
import Media from '../components/web/Media';

const articles = [
  {
    icon: <FaUserTie />,
    img: '/img/laodong/ld1.jpg',
    title: "'Nên đưa quyền ngắt kết nối vào Bộ luật Lao động'",
    desc: 'Chuyên gia gợi ý sớm luật hóa quyền ngắt kết nối sau giờ làm việc, tránh trạng thái lao động "thường trực 24h/7" với công việc trở thành điều bình thường mới.',

  },
  {
    icon: <FaMobileAlt />,
    img: '/img/laodong/ld2.jpg',
    title: 'Sau giờ làm, nhân viên có quyền không nghe điện thoại công việc từ sếp?',
    desc: 'Công ty tôi làm việc từ 8h đến 17h, nghỉ hai ngày cuối tuần. Tuy nhiên, ngoài giờ làm, sếp thường xuyên gọi điện để trao đổi công việc hoặc giao thêm nội dung cần xử lý.',

  },
  {
    icon: <FaSuitcaseRolling />,
    img: '/img/laodong/ld3.jpg',
    title: "'Phân bổ để mùa nào cũng có kỳ nghỉ dài hai, ba ngày'",
    desc: "'Mùa nào người lao động cũng cần có kỳ nghỉ dài khoảng 2-3 ngày liên tục thì mới có ý nghĩa: vừa nghỉ ngơi, vừa kích cầu chi tiêu'.",
  },
  {
    icon: <FaLaptop />,
    img: '/img/laodong/ld6.jpg',
    title: 'Vì sao người Việt còn loay hoay làm việc 40 giờ một tuần?',
    desc: 'Nhiều nước đã thảo luận về tuần làm việc bốn ngày, thậm chí ít hơn.',
    
  },
];

const popular = [
  { text: 'Ông Trump: Cuộc tập kích Beirut đáng lẽ không được diễn ra' },
  { text: 'Thủ khoa lớp 10 đạt điểm tuyệt đối Toán, Văn, Anh' },
  { text: "Mark Zuckerberg: 'Meta mắc sai lầm khi chuyển dịch nhân sự'"},
  { text: 'Châu Á thắng nhiều hơn châu Âu sau ba ngày đầu World Cup'},
  { text: "Hà Lan – Nhật Bản: Chờ tiếng nói của 'anh cả' châu Á ở World Cup 2026" },
];

const LaoDong = () => {
  return (
    <div className="min-h-screen flex flex-col font-body bg-surface text-svtext">
      <WebHeader logoSub="Nơi hội tụ và lan tỏa tri thức pháp luật" />

      <div className="max-w-[1180px] w-full mx-auto px-6">
        <div className="py-7 pb-4">
          <h1 className="font-serif text-[30px] font-bold text-navy">Lao động</h1>
        </div>
      </div>

      <main className="max-w-[1180px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10 pb-15 items-start">
        {/* Danh sách bài viết */}
        <section>
          {articles.map((a, i) => (
            <article
              key={i}
              className="group flex flex-col sm:flex-row gap-[22px] py-6 border-b border-svline first:pt-1"
            >
              <Link to="#" className="block flex-shrink-0">
                <Media
                  icon={<span className="text-[28px]">{a.icon}</span>}
                  src={a.img}
                  alt={a.title}
                  className="w-full sm:w-[240px] h-[156px] rounded-lg"
                />
              </Link>
              <div>
                <Link to="#">
                  <h3 className="font-serif text-[20px] font-bold text-navy leading-[1.35] mb-2.5 transition-colors group-hover:text-gold-dark">
                    {a.title}
                  </h3>
                </Link>
                <p className="text-sm text-svtext-secondary leading-relaxed line-clamp-3">{a.desc}</p>
                {a.count != null && (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[12.5px] text-svtext-muted font-medium">
                    <FaRegComment /> {a.count}
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* Sidebar */}
        <aside>
          {/* Xem nhiều */}
          <div className="bg-surface-alt rounded-xl p-5 mb-6">
            <div className="text-base font-bold text-navy uppercase tracking-wide pb-3 mb-1.5 border-b-2 border-gold">
              Xem nhiều
            </div>
            {popular.map((p, i) => (
              <Link key={i} to="#" className="group block py-3.5 border-b border-svline last:border-none last:pb-0">
                <p className="text-sm font-medium text-svtext leading-snug transition-colors group-hover:text-gold-dark">
                  {p.text}
                </p>
                {p.count != null && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-svtext-muted text-xs font-medium">
                    <FaRegComment /> {p.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Ảnh */}
          <div className="bg-surface-alt rounded-xl p-5 mb-6">
            <div className="text-base font-bold text-navy uppercase tracking-wide pb-3 mb-1.5 border-b-2 border-gold">
              Ảnh
            </div>
            <Link to="#" className="group block">
              <Media
                icon={<FaImage className="text-[26px]" />}
                src="/img/laodong/ld5.jpg"
                alt="Đường ven biển Gia Lai"
                className="h-[180px] rounded-[10px] mb-2.5"
              >
                <span className="absolute left-2.5 bottom-2.5 w-[26px] h-[26px] rounded-[5px] bg-navy/70 text-white flex items-center justify-center text-xs">
                  <FaCamera />
                </span>
              </Media>
              <h4 className="font-serif text-base font-bold text-navy leading-snug transition-colors group-hover:text-gold-dark">
                Diện mạo đường ven biển dài 115 km qua Gia Lai
              </h4>
            </Link>
          </div>
        </aside>
      </main>

      <WebFooter />
    </div>
  );
};

export default LaoDong;
