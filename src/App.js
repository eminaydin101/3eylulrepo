import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './pages/MainLayout';
import ToastContainer from './components/Toast';
import './index.css'; // Tailwind stillerini dahil ediyoruz

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

  // Eğer kullanıcı varsa ana uygulamayı, yoksa Login sayfasını göster
  return (
    <div className="bg-slate-100 min-h-screen">
      {user ? <MainLayout /> : <Login />}
      <ToastContainer />
    </div>
  );
}

export default App;