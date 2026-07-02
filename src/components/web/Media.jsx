import React from 'react';

// Nền gradient xám-navy dùng làm placeholder khi ảnh chưa tải / lỗi.
const gradient = {
  background:
    'linear-gradient(135deg, rgba(13,27,42,0.5), rgba(20,54,94,0.3)), linear-gradient(135deg, #9aa6b2, #cfd6dd)',
};

/**
 * Khung ảnh có icon placeholder phía sau; ảnh phủ lên trên, ẩn nếu lỗi.
 *
 * @param {React.ReactNode} icon   Icon placeholder (react-icons).
 * @param {string} src             URL ảnh.
 * @param {string} alt             Alt text.
 * @param {string} className       Class kích thước/bo góc cho khung.
 * @param {React.ReactNode} children  Lớp phủ tuỳ chọn (overlay, play button...).
 */
const Media = ({ icon, src, alt, className = '', children }) => (
  <div
    className={`relative overflow-hidden flex items-center justify-center text-white/80 ${className}`}
    style={gradient}
  >
    {icon}
    {src && (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    {children}
  </div>
);

export default Media;
