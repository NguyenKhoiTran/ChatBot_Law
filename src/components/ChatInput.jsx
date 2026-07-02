import React, { useState, useRef, useEffect } from 'react';
import { FaArrowUp, FaMicrophone } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useChat } from '../context/ChatContext';

const ChatInput = () => {
  const { sendMessage, isLoading } = useChat();
  const [input, setInput]          = useState('');
  const [isFocused, setIsFocused]  = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMsg, setVoiceMsg]    = useState('');
  const recognitionRef             = useRef(null);

  // Khởi tạo Web Speech API (SpeechRecognition) một lần
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      if (transcript.trim()) setVoiceMsg('');
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setVoiceMsg('❌ Không nghe được giọng nói. Hãy thử lại.');
      } else if (event.error === 'not-allowed') {
        setVoiceMsg('❌ Vui lòng cấp quyền sử dụng micro cho trình duyệt.');
      } else {
        setVoiceMsg(`❌ Lỗi nhận diện giọng nói: ${event.error}`);
      }
      setTimeout(() => setVoiceMsg(''), 5000);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch (_) { /* ignore */ }
    };
  }, []);

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

  const handleVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setVoiceMsg('❌ Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói.');
      setTimeout(() => setVoiceMsg(''), 5000);
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setVoiceMsg('');
      return;
    }

    try {
      setInput('');
      setVoiceMsg('🎙️ Đang nghe... Hãy nói câu hỏi của bạn.');
      recognition.start();
      setIsListening(true);
    } catch (_) {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-8 px-4 gap-2">
      {/* Voice feedback */}
      {voiceMsg && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-full border border-gray-200"
        >
          {voiceMsg}
        </motion.div>
      )}

      <motion.div
        className={`w-full max-w-[70%] flex items-center bg-white rounded-[30px] p-2 px-4 border shadow-lg transition-all duration-300 ${
          isFocused ? 'ring-2 ring-purple-500/50 border-purple-500/50' : 'border-gray-300 hover:border-gray-400'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        {/* Voice search button */}
        <div className="flex items-center space-x-2 mr-4">
          <button
            id="voice-search-btn"
            title="Tìm kiếm bằng giọng nói"
            onClick={handleVoiceSearch}
            disabled={isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <FaMicrophone size={17} />
          </button>
        </div>

        {/* Text input */}
        <input
          id="chat-input"
          type="text"
          placeholder={isLoading ? 'Đang xử lý...' : 'Hỏi về pháp luật...'}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 text-base placeholder-gray-400 disabled:cursor-not-allowed"
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
            className="w-9 h-9 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 disabled:text-gray-500 text-white transition-all duration-200"
          >
            {isLoading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FaArrowUp size={15} />
            }
          </button>
        </div>
      </motion.div>

      <p className="text-xs text-gray-500">Chatbot có thể mắc sai sót. Hãy kiểm tra thông tin pháp luật từ nguồn chính thức.</p>
    </div>
  );
};

export default ChatInput;
