import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './pages/MainLayout';
import './index.css'; // Tailwind stillerini dahil ediyoruz

function App() {
  const { user, loading } = useAuth();

  // Kullanıcı bilgisi local storage'dan okunurken bekle
  if (loading) {
    return (
        <div className="w-screen h-screen bg-slate-100 flex items-center justify-center">
            <p className="text-slate-500">Uygulama Yükleniyor...</p>
        </div>
    );
  }

  // Eğer kullanıcı varsa ana uygulamayı, yoksa Login sayfasını göster
  return (
    <div className="bg-slate-100 min-h-screen">
      {user ? <MainLayout /> : <Login />}
    </div>
  );
}

export default App;