import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/Dashboard';
import ProcessTable from '../components/ProcessTable';
import AdminPanel from '../components/AdminPanel';
import ChatPanel from '../components/ChatPanel';
import ProcessModal from '../components/modals/ProcessModal';
import UserModal from '../components/modals/UserModal';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const { processes, users, firmalar, kategoriler, logs, loading, addProcess, updateProcess, deleteProcess, addUser, editUser, removeUser } = useData();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const isAdmin = user && (user.role === 'Admin' || user.role === 'SuperAdmin');

    // --- YENİ EKLENEN STATE'LER ---
    const [processView, setProcessView] = useState('active');
    const [sortConfig, setSortConfig] = useState({ key: 'baslangicTarihi', direction: 'descending' });
    const [filters, setFilters] = useState({
        searchTerm: '', firma: 'all', kategori: 'all', sorumlu: 'all'
    });

    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isProcessEditMode, setIsProcessEditMode] = useState(false);
    const [currentProcessData, setCurrentProcessData] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isUserEditMode, setIsUserEditMode] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(null);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedRows = useMemo(() => {
        let items = [...(processes || [])];
        if (filters.firma !== 'all') items = items.filter(p => p.firma === filters.firma);
        if (filters.kategori !== 'all') items = items.filter(p => p.kategori === filters.kategori);
        if (filters.sorumlu !== 'all') items = items.filter(p => p.sorumlular.includes(filters.sorumlu));
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            items = items.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(term)));
        }
        if (sortConfig.key) {
            items.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [processes, filters, sortConfig]);

    const activeRows = filteredAndSortedRows.filter(row => row.durum !== 'Tamamlandı');
    const completedRows = filteredAndSortedRows.filter(row => row.durum === 'Tamamlandı');
    const myProcesses = useMemo(() => filteredAndSortedRows.filter(p => p.sorumlular.includes(user?.fullName)), [filteredAndSortedRows, user]);

    useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);

    const handleOpenNewProcessModal = () => { setIsProcessEditMode(false); setCurrentProcessData(null); setIsProcessModalOpen(true); };
    const handleOpenEditProcessModal = (process) => { setIsProcessEditMode(true); setCurrentProcessData(process); setIsProcessModalOpen(true); };
    const handleProcessSubmit = async (formData) => { try { if (isProcessEditMode) await updateProcess(formData.id, formData); else await addProcess(formData); setIsProcessModalOpen(false); } catch (error) { alert("Süreç işlemi hatası."); }};
    const handleDeleteProcess = async (processData) => { if (window.confirm("Bu süreci silmek istediğinizden emin misiniz?")) { try { await deleteProcess(processData.id); setIsProcessModalOpen(false); } catch (error) { alert("Silme hatası."); }}};
    const handleOpenNewUserModal = () => { setIsUserEditMode(false); setCurrentUserData(null); setIsUserModalOpen(true); };
    const handleOpenEditUserModal = (user) => { setIsUserEditMode(true); setCurrentUserData(user); setIsUserModalOpen(true); };
    const handleUserSubmit = async (formData) => { try { if (isUserEditMode) await editUser(formData.id, formData); else await addUser(formData); setIsUserModalOpen(false); } catch (error) { alert("Kullanıcı işlemi hatası."); }};
    const handleUserDelete = async (userToDelete) => { if (window.confirm(`${userToDelete.fullName} adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) { try { await removeUser(userToDelete.id); } catch (error) { alert("Kullanıcı silme hatası."); }}};

    if (loading) { return <div className="flex justify-center items-center h-screen"><p>Veriler Yükleniyor...</p></div>; }

    return (
        <div className="h-screen bg-slate-100 dark:bg-slate-900">
            <div className="flex flex-col h-full">
                <Header onTabChange={setActiveTab} activeTab={activeTab} onToggleSidebar={() => setSidebarOpen(true)} onLogout={logout} theme={theme} handleThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {activeTab === 'dashboard' && <Dashboard processes={processes} users={users} logs={logs} handleGraphClick={() => {}} />}

                    {activeTab === 'processTable' && (
                        <div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <input type="text" placeholder="Genel Arama..." value={filters.searchTerm} onChange={e => handleFilterChange('searchTerm', e.target.value)} className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"/>
                                    <select value={filters.firma} onChange={e => handleFilterChange('firma', e.target.value)} className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"><option value="all">Tüm Firmalar</option>{Object.keys(firmalar).map(f => <option key={f} value={f}>{f}</option>)}</select>
                                    <select value={filters.kategori} onChange={e => handleFilterChange('kategori', e.target.value)} className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"><option value="all">Tüm Kategoriler</option>{Object.keys(kategoriler).map(k => <option key={k} value={k}>{k}</option>)}</select>
                                    <select value={filters.sorumlu} onChange={e => handleFilterChange('sorumlu', e.target.value)} className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"><option value="all">Tüm Sorumlular</option>{users.map(u => <option key={u.id} value={u.fullName}>{u.fullName}</option>)}</select>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setProcessView('active')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${processView === 'active' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>Aktif ({activeRows.length})</button>
                                    <button onClick={() => setProcessView('completed')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${processView === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>Tamamlanmış ({completedRows.length})</button>
                                </div>
                                <button onClick={handleOpenNewProcessModal} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">+ Yeni Süreç</button>
                            </div>
                            <ProcessTable tableRows={processView === 'active' ? activeRows : completedRows} onEdit={handleOpenEditProcessModal} sortConfig={sortConfig} handleSort={requestSort} userRole={user.role} />
                        </div>
                    )}

                    {activeTab === 'myProcesses' && <ProcessTable tableRows={myProcesses} onEdit={handleOpenEditProcessModal} sortConfig={sortConfig} handleSort={requestSort} userRole={user.role} />}

                    {isAdmin && activeTab === 'admin' && <AdminPanel users={users} firmalar={firmalar} kategoriler={kategoriler} openUserModal={handleOpenEditUserModal} openNewUserModal={handleOpenNewUserModal} requestUserDelete={handleUserDelete} />}
                </main>
            </div>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onTabChange={setActiveTab} activeTab={activeTab} isAdmin={isAdmin} />
            {isProcessModalOpen && <ProcessModal isOpen={isProcessModalOpen} onClose={() => setIsProcessModalOpen(false)} onSubmit={handleProcessSubmit} isEditMode={isProcessEditMode} initialData={currentProcessData} onDelete={handleDeleteProcess} />}
            {isUserModalOpen && <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSubmit={handleUserSubmit} isEditMode={isUserEditMode} initialData={currentUserData} />}
            {isChatOpen && <ChatPanel user={user} allUsers={users} onUserSelect={() => {}} onClose={() => setChatOpen(false)} />}
            <button onClick={() => setChatOpen(o => !o)} title="Mesajlaşma" className="fixed bottom-6 right-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-50">Sohbet</button>
        </div>
    );
};

export default MainLayout;