import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    if (password !== confirmPwd)           { setError('Mật khẩu xác nhận không khớp'); return; }
    if (password.length < 6)              { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#2a2b32] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";

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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tên đăng nhập</label>
            <input id="reg-username" type="text" className={inputClass} placeholder="nguyenvana"
              value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input id="reg-email" type="email" className={inputClass} placeholder="example@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
            <input id="reg-password" type="password" className={inputClass} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Xác nhận mật khẩu</label>
            <input id="reg-confirm" type="password" className={inputClass} placeholder="••••••••"
              value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} disabled={loading} />
          </div>

          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4285F4] to-[#9b72cb] text-white font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Đăng nhập
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
