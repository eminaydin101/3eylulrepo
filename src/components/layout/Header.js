import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onTabChange, activeTab, onToggleSidebar, onLogout, theme, handleThemeToggle }) => {
    const { user } = useAuth();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [systemSettings, setSystemSettings] = useState({
        siteName: 'Süreç Yönetimi',
        logoUrl: ''
    });
    
    const profileMenuRef = useRef();
    const isAdmin = user && (user.role === 'Admin' || user.role === 'SuperAdmin');

    // Sistem ayarlarını yükle
    useEffect(() => {
        const loadSystemSettings = async () => {
            try {
                const storedSettings = localStorage.getItem('systemSettings');
                if (storedSettings) {
                    setSystemSettings(JSON.parse(storedSettings));
                }
            } catch (error) {
                console.error('Sistem ayarları yüklenemedi:', error);
            }
        };
        
        loadSystemSettings();
    }, []);

    // Profil menüsü dışına tıklandığında kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isProfileMenuOpen]);

    if (!user) return null;

    const userInitials = (user.fullName || user.email).split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <header className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 shadow-md z-20 relative">
            {/* Sol Taraf */}
            <div className="flex items-center gap-4">
                {/* Logo ve Site Adı */}
                <div className="flex items-center gap-3">
                    {systemSettings.logoUrl && (
                        <img 
                            src={systemSettings.logoUrl} 
                            alt="Logo" 
                            className="h-8 w-8 object-contain rounded"
                        />
                    )}
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {systemSettings.siteName}
                    </h1>
                </div>
                
                {/* Navigation Tabs - Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-6">
                    <button 
                        onClick={() => onTabChange('dashboard')} 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === 'dashboard' 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button 
                        onClick={() => onTabChange('processTable')} 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === 'processTable' 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span>📋</span>
                        <span>Tüm Süreçler</span>
                    </button>
                    {/* YENİ: Süreçlerim Butonu */}
                    <button 
                        onClick={() => onTabChange('myProcesses')} 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === 'myProcesses' 
                                ? 'bg-green-600 text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                        }`}
                    >
                        <span>👤</span>
                        <span>Süreçlerim</span>
                    </button>
                    {/* Admin Panel Butonu - Desktop */}
                    {isAdmin && (
                        <button 
                            onClick={() => onTabChange('admin')} 
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                activeTab === 'admin' 
                                    ? 'bg-purple-600 text-white shadow-sm' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900'
                            }`}
                        >
                            <span>⚙️</span>
                            <span>Admin Panel</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Sağ Taraf */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Tema Değiştir Butonu */}
                <button 
                    onClick={handleThemeToggle} 
                    title="Temayı Değiştir" 
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="text-xl">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </span>
                </button>

                {/* Profil Menüsü */}
                <div className="relative" ref={profileMenuRef}>
                    <button 
                        onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {userInitials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {user.fullName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user.role}
                            </p>
                        </div>
                        <span className={`transform transition-transform text-slate-400 ${isProfileMenuOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 w-64 z-30 py-2">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {userInitials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            {user.fullName}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {user.email}
                                        </p>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button 
                                    onClick={() => {
                                        onTabChange('profile');
                                        setProfileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
                                >
                                    <span>👤</span>
                                    <span>Profilim</span>
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        onTabChange('settings');
                                        setProfileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
                                >
                                    <span>⚙️</span>
                                    <span>Ayarlar</span>
                                </button>

                                <div className="border-t dark:border-slate-700 my-2"></div>
                                
                                <button 
                                    onClick={() => {
                                        onLogout();
                                        setProfileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                                >
                                    <span>🚪</span>
                                    <span>Çıkış Yap</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button - Hamburger */}
                <button 
                    onClick={onToggleSidebar} 
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 md:hidden transition-colors"
                    title="Menüyü Aç"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;