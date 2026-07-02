import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPwd, setShowConfirmPwd]   = useState(false);
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
      navigate('/hoi-dap', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";

  return (
    <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký</h1>
          <p className="text-gray-500">Tạo tài khoản mới</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
            <input id="reg-username" type="text" className={inputClass}
              value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input id="reg-email" type="email" className={inputClass}
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <input id="reg-password" type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-12`}
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 transition-colors disabled:cursor-not-allowed"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
            <div className="relative">
              <input id="reg-confirm" type={showConfirmPwd ? 'text' : 'password'} className={`${inputClass} pr-12`}
                value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} disabled={loading} />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((prev) => !prev)}
                disabled={loading}
                aria-label={showConfirmPwd ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 transition-colors disabled:cursor-not-allowed"
              >
                {showConfirmPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
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

        <p className="text-center text-gray-500 mt-6">
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
