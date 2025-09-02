import React from 'react';

const Sidebar = ({ isOpen, onClose, onTabChange, activeTab, isAdmin }) => {
    const changeTab = (tab) => {
        onTabChange(tab);
        onClose();
    };

    const navLinkStyle = "w-full flex items-center gap-3 p-3 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors";
    const activeLinkStyle = "bg-blue-100 text-blue-700 dark:bg-blue-900/50";

    return (
        <>
            {/* Panel açıkken arkadaki içeriği karartan overlay */}
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full bg-white dark:bg-slate-800 shadow-2xl z-50 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Menü</h2>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-2xl">&times;</button>
                </div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => changeTab('dashboard')} className={`${navLinkStyle} ${activeTab === 'dashboard' && activeLinkStyle}`}>
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button onClick={() => changeTab('processTable')} className={`${navLinkStyle} ${activeTab === 'processTable' && activeLinkStyle}`}>
                        <span>📋</span>
                        <span>Tüm Süreçler</span>
                    </button>
                    <button onClick={() => changeTab('myProcesses')} className={`${navLinkStyle} ${activeTab === 'myProcesses' && activeLinkStyle}`}>
                        <span>👤</span>
                        <span>Süreçlerim</span>
                    </button>
                    {isAdmin && (
                        <button onClick={() => changeTab('admin')} className={`${navLinkStyle} ${activeTab === 'admin' && activeLinkStyle}`}>
                            <span>⚙️</span>
                            <span>Admin Paneli</span>
                        </button>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;