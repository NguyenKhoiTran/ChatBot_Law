import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex h-screen w-full bg-dark-bg items-center justify-center">
      <motion.div 
        className="w-full max-w-md bg-[#17171a] p-8 rounded-2xl shadow-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Đăng ký</h1>
          <p className="text-gray-400">Tạo tài khoản mới</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Họ và tên</label>
            <input 
              type="text" 
              className="w-full bg-[#2a2b32] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#2a2b32] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full bg-[#2a2b32] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="button"
            className="w-full bg-gradient-to-r from-[#4285F4] to-[#9b72cb] text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity"
          >
            <Link to="/" className="w-full block">Đăng ký</Link>
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Đã có tài khoản? <Link to="/login" className="text-purple-400 hover:text-purple-300">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
