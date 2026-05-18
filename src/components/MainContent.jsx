import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBalanceScale, FaBookOpen } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';

// ─── Typing indicator ──────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-purple-400"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

// ─── Single message bubble ─────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
          <FaBalanceScale size={13} className="text-white" />
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
              : 'bg-[#2a2b32] text-gray-100 border border-gray-700/50 rounded-bl-sm'
          }`}
        >
          {msg.content}
        </div>

        {/* Sources citation */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="w-full">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <FaBookOpen size={11} />
              <span>Nguồn tham khảo</span>
            </div>
            <div className="flex flex-col gap-1">
              {msg.sources.map((src, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-400 bg-[#1e1f24] border border-gray-700/40 rounded-lg px-3 py-2"
                >
                  <span className="text-purple-400 font-medium">{src.source}</span>
                  {' — '}
                  <span className="text-gray-500 line-clamp-1">{src.article}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main content ──────────────────────────────────────────────────────────
const MainContent = () => {
  const { messages, isLoading } = useChat();
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-6"
        >
          <FaBalanceScale size={28} className="text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-[42px] font-bold text-gradient text-center leading-tight"
        >
          Tôi có thể giúp gì cho bạn?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mt-3 text-base"
        >
          Hỏi về bất kỳ điều luật, nghị định, hoặc quy định pháp luật nào
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 overflow-y-auto">
      <AnimatePresence initial={false}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </AnimatePresence>

      {/* Typing indicator while waiting for response */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start mb-4"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
            <FaBalanceScale size={13} className="text-white" />
          </div>
          <div className="bg-[#2a2b32] border border-gray-700/50 rounded-2xl rounded-bl-sm">
            <TypingDots />
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MainContent;
