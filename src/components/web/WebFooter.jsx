import React from 'react';
import { FaFacebookF, FaTiktok, FaYoutube, FaInstagram } from 'react-icons/fa';

const socials = [FaFacebookF, FaTiktok, FaYoutube, FaInstagram];

const WebFooter = () => {
  return (
    <footer className="bg-surface-alt border-t border-svborder mt-auto">
      <div className="max-w-[1200px] mx-auto px-8 py-[22px] flex items-center justify-between flex-wrap gap-4">
        <p className="text-[12.5px] text-svtext-muted">
          © 2026 SVLaw. Nền Tảng Pháp Luật Sinh Viên Việt Nam.
        </p>
        <div className="flex gap-2.5">
          {socials.map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="w-[34px] h-[34px] bg-surface border border-svborder rounded-lg flex items-center justify-center text-svtext-secondary text-sm transition-all hover:bg-gold/12 hover:text-gold hover:border-gold"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default WebFooter;
