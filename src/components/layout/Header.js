import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onTabChange, activeTab, onToggleSidebar, onLogout, theme, handleThemeToggle }) => {
    const { user } = useAuth();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

    if (!user) return null;

    const userInitials = (user.fullName || user.email).split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <header className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-t-2xl shadow">
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="p-2 rounded-full text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m4 6h16" /></svg>
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">Süreç Yönetimi</h1>
                <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => onTabChange('dashboard')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                        <span>Dashboard</span>
                    </button>
                     <button onClick={() => onTabChange('processTable')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'processTable' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" /></svg>
                        <span>Tüm Süreçler</span>
                    </button>
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 relative">
                <button onClick={handleThemeToggle} title="Temayı Değiştir" className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors">
                    {theme === 'light' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 011.414 0l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" /></svg>
                    }
                </button>
                <button onClick={() => setProfileMenuOpen(p => !p)} className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {userInitials}
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 w-48 z-20" onMouseLeave={() => setProfileMenuOpen(false)}>
                        <div className="p-4 border-b dark:border-slate-700">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{user.fullName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">Çıkış Yap</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;