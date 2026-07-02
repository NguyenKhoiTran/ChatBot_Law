import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaCarSide, FaMotorcycle, FaArchway, FaRoad, FaClipboardCheck, FaTractor,
  FaCarCrash, FaChargingStation, FaVideo, FaPlay, FaMapMarkerAlt, FaComments,
} from 'react-icons/fa';
import WebHeader from '../components/web/WebHeader';
import WebFooter from '../components/web/WebFooter';
import Media from '../components/web/Media';

const featuredList = [
  {
    icon: <FaMotorcycle />,
    img: '/img/giaothong/gt1.jpg',
    title: 'Nâng cao ý thức người tham gia giao thông',
    desc: 'TP.HCM kêu gọi người tham gia giao thông tuân thủ luật, đảm bảo an toàn cho bản thân và cộng đồng.',
  },
  {
    icon: <FaArchway />,
    img: '/img/giaothong/gt2.jpg',
    title: 'Khánh thành cầu Mỹ Thuận 2',
    desc: 'Cầu Mỹ Thuận 2 chính thức đưa vào sử dụng, kết nối giao thông vùng Đồng bằng sông Cửu Long.',
  },
  {
    icon: <FaRoad />,
    img: '/img/giaothong/gt3.jpg',
    title: 'Cao tốc mới rút ngắn thời gian di chuyển',
    desc: 'Tuyến cao tốc vừa thông xe giúp giảm tải áp lực giao thông và rút ngắn hành trình.',
  },
];

const newsCards = [
  {
    icon: <FaClipboardCheck />,
    img: '/img/giaothong/gt4.jpg',
    title: 'Quy định mới về đăng kiểm ô tô',
    desc: 'Quy định mới về đăng kiểm ô tô áp dụng từ đầu năm, người dân cần lưu ý các mốc thời gian.',
  },
  {
    icon: <FaTractor />,
    img: '/img/giaothong/gt5.jpg',
    title: 'Hạ tầng giao thông nông thôn được nâng cấp',
    desc: 'Nhiều tuyến đường nông thôn được đầu tư nâng cấp, tạo thuận lợi cho lưu thông hàng hóa.',
  },
  {
    icon: <FaCarCrash />,
    img: '/img/giaothong/gt6.jpg',
    title: 'Nhiều vụ tai nạn giao thông nghiêm trọng trong tuần',
    desc: 'Cơ quan chức năng cảnh báo và tăng cường tuần tra nhằm kéo giảm tai nạn giao thông.',
  },
  {
    icon: <FaChargingStation />,
    img: '/img/giaothong/gt7.jpg',
    title: 'Thị trường xe máy điện tăng trưởng mạnh',
    desc: 'Xe máy điện ngày càng phổ biến nhờ chi phí vận hành thấp và thân thiện môi trường.',
  },
];

const videos = [
  { img: '/img/giaothong/gt8.jpg', text: 'TP.HCM kẹt xe kéo dài các cửa ngõ, ùn ứ giờ cao điểm' },
  { img: '/img/giaothong/gt9.jpg', text: 'Nâng cao ý thức người tham gia giao thông' },
];

const qa = [
  'Mức phạt khi không đội mũ bảo hiểm mới nhất là bao nhiêu?',
  'Bằng lái xe hết hạn thì có bị xử phạt không?',
  'Quy định mới về nồng độ cồn khi điều khiển phương tiện?',
];

const sectionHeading =
  'text-[18px] font-bold text-navy mb-4.5 pb-2 border-b-2 border-gold inline-block';

const GiaoThong = () => {
  return (
    <div className="min-h-screen flex flex-col font-body bg-cream text-svtext">
      <WebHeader logoSub="Nền tảng pháp luật Việt Nam" />

      <div className="max-w-[1200px] w-full mx-auto px-8">
        <h1 className="font-serif text-[30px] font-bold text-navy py-7 pb-[22px]">
          <span className="text-gold">GIAO THÔNG</span> — TIN TỨC &amp; TÌNH HÌNH AN TOÀN GIAO THÔNG 24H
        </h1>
      </div>

      <main className="max-w-[1200px] w-full mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 pb-12">
        {/* Cột chính */}
        <section>
          <h2 className={sectionHeading}>Tin nổi bật</h2>

          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-[22px] mb-9">
            {/* Featured card */}
            <Link
              to="#"
              className="relative block rounded-xl overflow-hidden min-h-[320px] shadow-[0_4px_18px_rgba(13,27,42,0.1)] transition-transform hover:-translate-y-[3px]"
            >
              <Media
                icon={<FaCarSide className="text-[26px]" />}
                src="/img/giaothong/gt10.jpg"
                alt="Kẹt xe TP.HCM"
                className="absolute inset-0"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-[26px] bg-[linear-gradient(180deg,transparent_35%,rgba(13,27,42,0.85)_100%)]">
                <h3 className="text-white text-[22px] font-bold leading-[1.35] mb-2">
                  TP.HCM: Kẹt xe kéo dài tại các cửa ngõ, người dân vất vả di chuyển
                </h3>
                <div className="text-white/80 text-xs flex items-center gap-1.5">
                  <FaMapMarkerAlt /> Hồ Chí Minh · 2 giờ trước
                </div>
              </div>
            </Link>

            {/* Danh sách nhỏ */}
            <div className="flex flex-col gap-4">
              {featuredList.map((a, i) => (
                <Link
                  key={i}
                  to="#"
                  className="group flex gap-3.5 items-start pb-4 border-b border-svline last:border-none last:pb-0"
                >
                  <Media
                    icon={<span className="text-lg">{a.icon}</span>}
                    src={a.img}
                    alt={a.title}
                    className="w-[110px] h-[74px] rounded-lg flex-shrink-0"
                  />
                  <div>
                    <h4 className="text-[14.5px] font-semibold text-svtext leading-snug mb-1 transition-colors group-hover:text-gold">
                      {a.title}
                    </h4>
                    <p className="text-[12.5px] text-svtext-muted line-clamp-2">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Lưới tin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {newsCards.map((c, i) => (
              <Link
                key={i}
                to="#"
                className="group block bg-surface border border-svline rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(13,27,42,0.12)] hover:border-svborder"
              >
                <Media icon={<span className="text-2xl">{c.icon}</span>} src={c.img} alt={c.title} className="h-[130px]" />
                <div className="p-3.5">
                  <h4 className="text-sm font-semibold text-svtext leading-snug mb-1.5 transition-colors group-hover:text-gold">
                    {c.title}
                  </h4>
                  <p className="text-xs text-svtext-muted line-clamp-2">{c.desc}</p>
                  <div className="text-[11px] text-gold-dark mt-2 font-medium">Vietnam+</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside>
          {/* Video */}
          <div className="bg-surface border border-svline rounded-xl p-[18px] mb-[22px]">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy mb-3.5 pb-2.5 border-b border-svline">
              <FaVideo className="text-gold" /> Video Giao thông
            </h3>
            <Link to="#" className="group relative block h-[160px] rounded-[10px] overflow-hidden mb-2">
              <Media
                icon={<FaRoad />}
                src="/img/giaothong/gt10.jpg"
                alt="kẹt xe"
                className="absolute inset-0"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-white/90 text-navy flex items-center justify-center text-lg shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-110">
                <FaPlay className="ml-0.5" />
              </div>
              <div className="absolute left-0 right-0 bottom-0 px-3 py-2.5 bg-[linear-gradient(transparent,rgba(13,27,42,0.85))] text-white text-[13px] font-semibold">
                TP.HCM: Kẹt xe kéo dài tại các cửa ngõ, ách tắc
              </div>
            </Link>
            {videos.map((v, i) => (
              <Link
                key={i}
                to="#"
                className="group flex gap-2.5 items-center py-2.5 border-b border-svline last:border-none last:pb-0"
              >
                <Media icon={<FaPlay className="text-[13px]" />} src={v.img} alt="" className="w-[76px] h-[50px] rounded-md flex-shrink-0" />
                <span className="text-[12.5px] text-svtext-secondary leading-snug transition-colors group-hover:text-gold">
                  {v.text}
                </span>
              </Link>
            ))}
          </div>

          {/* Hỏi đáp */}
          <div className="bg-surface border border-svline rounded-xl p-[18px] mb-[22px]">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy mb-3.5 pb-2.5 border-b border-svline">
              <FaComments className="text-gold" /> Hỏi đáp Luật giao thông
            </h3>
            {qa.map((q, i) => (
              <Link
                key={i}
                to="/hoi-dap"
                className="group flex gap-2.5 items-start py-2.5 border-b border-svline last:border-none last:pb-0"
              >
                <div className="w-[26px] h-[26px] rounded-full bg-gold/15 text-gold flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ?
                </div>
                <p className="text-[12.5px] text-svtext-secondary leading-snug transition-colors group-hover:text-gold">
                  {q}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      </main>

      <WebFooter />
    </div>
  );
};

export default GiaoThong;
