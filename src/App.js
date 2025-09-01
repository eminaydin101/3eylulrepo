import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './pages/MainLayout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ToastContainer from './components/Toast';
import './index.css';

function App() {
  const { user, loading } = useAuth();

  // Kullanıcı bilgisi local storage'dan okunurken bekle
  if (loading) {
    return (
        <div className="w-screen h-screen bg-slate-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Uygulama Yükleniyor...</p>
            </div>
        </div>
    );
  }

  return (
    <Router>
      <div className="bg-slate-100 min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/forgot-password" 
            element={user ? <Navigate to="/" replace /> : <ForgotPassword />} 
          />
          <Route 
            path="/reset-password" 
            element={user ? <Navigate to="/" replace /> : <ResetPassword />} 
          />
          <Route 
            path="/verify-email" 
            element={user ? <Navigate to="/" replace /> : <VerifyEmail />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={user ? <MainLayout /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <MainLayout /> : <Navigate to="/login" replace />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/" : "/login"} replace />} 
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;