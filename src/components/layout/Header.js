import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onTabChange, activeTab, onToggleSidebar, onLogout, theme, handleThemeToggle }) => {
    const { user } = useAuth();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

    if (!user) return null;

    const userInitials = (user.fullName || user.email).split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        // DÜZELTME: Header'a z-index (z-20) eklendi.
        <header className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 shadow-md z-20 relative">
            {/* Sol Taraf */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">Süreç Yönetimi</h1>
                <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => onTabChange('dashboard')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                       <span>Dashboard</span>
                    </button>
                     <button onClick={() => onTabChange('processTable')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'processTable' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                       <span>Tüm Süreçler</span>
                    </button>
                </div>
            </div>

            {/* Sağ Taraf */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button onClick={handleThemeToggle} title="Temayı Değiştir" className="p-2 rounded-full text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Profil Menüsü için bir sarmalayıcı (wrapper) eklendi */}
                <div className="relative">
                    <button onClick={() => setProfileMenuOpen(p => !p)} className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {userInitials}
                    </button>
                    {isProfileMenuOpen && (
                        // DÜZELTME: Açılır menüye daha yüksek bir z-index (z-30) eklendi.
                        <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 w-48 z-30" onMouseLeave={() => setProfileMenuOpen(false)}>
                            <div className="p-4 border-b dark:border-slate-700">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{user.fullName}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">Çıkış Yap</button>
                        </div>
                    )}
                </div>

                <button onClick={onToggleSidebar} className="p-2 rounded-full text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;