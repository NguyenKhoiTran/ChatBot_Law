import React from 'react';
import { motion } from 'framer-motion';

const MainContent = () => {
  return (
    <div className="flex-1 flex items-center justify-center w-full">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-[52px] font-bold text-gradient text-center"
      >
        Can i help you !
      </motion.h1>
    </div>
  );
};

export default MainContent;
