import React, { useState } from 'react';
import { FaPlus, FaMicrophone } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const ChatInput = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full flex justify-center pb-8 px-4">
      <motion.div 
        className={`w-full max-w-[70%] flex items-center bg-[#2a2b32] rounded-[30px] p-2 px-4 border border-gray-700 shadow-lg transition-all duration-300 ${isFocused ? 'ring-2 ring-purple-500/50 border-purple-500/50' : 'hover:border-gray-500'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        {/* Left Side */}
        <div className="flex items-center space-x-3 mr-4">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200">
            <FaPlus size={18} />
          </button>
          <button className="px-4 py-1.5 rounded-full bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-sm font-medium transition-colors duration-200 whitespace-nowrap">
            Deep search
          </button>
        </div>

        {/* Center Input */}
        <input
          type="text"
          placeholder="Hỏi ChatBot"
          className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-400"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Right Side */}
        <div className="ml-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-transparent hover:bg-gray-700 transition-colors duration-200">
            <FaMicrophone size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInput;
