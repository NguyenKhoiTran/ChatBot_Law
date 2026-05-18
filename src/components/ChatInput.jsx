import React, { useState, useRef } from 'react';
import { FaArrowUp, FaPaperclip } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import { documentsApi } from '../services/api';

const ChatInput = () => {
  const { sendMessage, isLoading } = useChat();
  const [input, setInput]          = useState('');
  const [isFocused, setIsFocused]  = useState(false);
  const [uploading, setUploading]  = useState(false);
  const [uploadMsg, setUploadMsg]  = useState('');
  const fileRef                    = useRef(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const res = await documentsApi.upload(file);
      setUploadMsg(`✅ Đã nạp ${res.articles_found} điều từ "${res.filename}"`);
    } catch (err) {
      setUploadMsg(`❌ Lỗi: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
      setTimeout(() => setUploadMsg(''), 5000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-8 px-4 gap-2">
      {/* Upload feedback */}
      {uploadMsg && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-300 bg-[#2a2b32] px-4 py-2 rounded-full border border-gray-700"
        >
          {uploadMsg}
        </motion.div>
      )}

      <motion.div
        className={`w-full max-w-[70%] flex items-center bg-[#2a2b32] rounded-[30px] p-2 px-4 border shadow-lg transition-all duration-300 ${
          isFocused ? 'ring-2 ring-purple-500/50 border-purple-500/50' : 'border-gray-700 hover:border-gray-500'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        {/* Upload button */}
        <div className="flex items-center space-x-2 mr-4">
          <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
          <button
            id="upload-doc-btn"
            title="Upload văn bản luật (PDF/DOCX)"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
          >
            {uploading
              ? <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              : <FaPaperclip size={17} />
            }
          </button>
        </div>

        {/* Text input */}
        <input
          id="chat-input"
          type="text"
          placeholder={isLoading ? 'Đang xử lý...' : 'Hỏi về pháp luật...'}
          className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-gray-400 disabled:cursor-not-allowed"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
        />

        {/* Send button */}
        <div className="ml-4">
          <button
            id="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-all duration-200"
          >
            {isLoading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FaArrowUp size={15} />
            }
          </button>
        </div>
      </motion.div>

      <p className="text-xs text-gray-600">Chatbot có thể mắc sai sót. Hãy kiểm tra thông tin pháp luật từ nguồn chính thức.</p>
    </div>
  );
};

export default ChatInput;
