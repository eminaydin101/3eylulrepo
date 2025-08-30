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
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"></div>}
            <div className={`fixed lg:relative top-0 left-0 h-full bg-white dark:bg-slate-800 shadow-2xl z-50 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Menü</h2>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-2xl lg:hidden">&times;</button>
                </div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => changeTab('myProcesses')} className={`${navLinkStyle} ${activeTab === 'myProcesses' && activeLinkStyle}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/></svg>
                        <span>Süreçlerim</span>
                    </button>
                    {isAdmin && (
                        <button onClick={() => changeTab('admin')} className={`${navLinkStyle} ${activeTab === 'admin' && activeLinkStyle}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                            <span>Admin Paneli</span>
                        </button>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;