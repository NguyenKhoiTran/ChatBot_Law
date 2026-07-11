import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import GiaoThong from './pages/GiaoThong';
import GiaoDuc from './pages/GiaoDuc';
import AnNinhMang from './pages/AnNinhMang';
import LaoDong from './pages/LaoDong';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            {/* Web / landing (public) */}
            <Route path="/"             element={<Home />} />
            <Route path="/giao-thong"   element={<GiaoThong />} />
            <Route path="/giao-duc"     element={<GiaoDuc />} />
            <Route path="/an-ninh-mang" element={<AnNinhMang />} />
            <Route path="/lao-dong"     element={<LaoDong />} />

            {/* Chatbot (protected) */}
            <Route
              path="/hoi-dap"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
