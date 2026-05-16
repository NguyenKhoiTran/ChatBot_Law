import React from 'react';
import Header from '../components/Header';
import MainContent from '../components/MainContent';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';

const Chat = () => {
  return (
    <div className="flex h-screen w-full bg-dark-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Header />
        <div className="flex-1 flex flex-col justify-between items-center relative overflow-y-auto">
          <MainContent />
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default Chat;
