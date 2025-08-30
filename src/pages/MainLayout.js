import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

// Bileşenleri import ediyoruz
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/Dashboard';
import ProcessTable from '../components/ProcessTable';
import AdminPanel from '../components/AdminPanel';
import ChatPanel from '../components/ChatPanel';
import ProcessModal from '../components/modals/ProcessModal';
import UserModal from '../components/modals/UserModal';

const SOCKET_URL = 'http://localhost:3001';

const MainLayout = () => {
    // DataContext'ten 'messages' değişkenini de alıyoruz
    const { user, logout } = useAuth();
    const { processes, users, firmalar, kategoriler, logs, messages, loading, fetchData, addProcess, updateProcess, deleteProcess } = useData();

    // --- Orijinal App.js'den Gelen Tüm UI State'leri ---
    const [socket, setSocket] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [processView, setProcessView] = useState('active');
    const [activeSearch, setActiveSearch] = useState('');
    const [completedSearch, setCompletedSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'baslangicTarihi', direction: 'descending' });
    const [dashboardFilter, setDashboardFilter] = useState(null);

    // Modal State'leri
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isAccountSettingsOpen, setAccountSettingsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProcessData, setCurrentProcessData] = useState(null);

    // UI Elemanları State'leri
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // --- User Bağlantısı State'leri ---
    const { /* ... */, addUser, editUser, removeUser } = useData();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isUserEditMode, setIsUserEditMode] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(null);


    // --- Socket.io Bağlantısı ve Olay Dinleyicileri ---
    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('user_online', user);
        newSocket.on('update_online_users', setOnlineUsers);

        newSocket.on('data_changed', () => {
            console.log('Veri değişikliği algılandı, veriler yenileniyor...');
            fetchData();
        });

        newSocket.on('receive_message', (newMessage) => {
            console.log('Yeni mesaj alındı, veriler yenileniyor...');
            fetchData(); 
        });

        newSocket.on('new_message_notification', ({ senderId, senderName }) => {
            setUnreadMessages(prev => ({...prev, [senderId]: (prev[senderId] || 0) + 1 }));
            if(!isChatOpen) alert(`${senderName} adlı kullanıcıdan yeni bir mesajınız var!`);
        });

        return () => newSocket.disconnect();
    }, [user, fetchData, isChatOpen]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);


    // --- Fonksiyonlar (Handlers) ---
    const handleOpenNewProcessModal = () => {
        setIsEditMode(false);
        setCurrentProcessData(null); 
        setIsProcessModalOpen(true);
    };

    const handleOpenEditProcessModal = (process) => {
        setIsEditMode(true);
        setCurrentProcessData(process);
        setIsProcessModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsProcessModalOpen(false);
        setIsUserModalOpen(false);
        setAccountSettingsOpen(false);
    };

    const handleProcessSubmit = async (formData) => {
        try {
            if (isEditMode) {
                await updateProcess(formData.id, formData);
            } else {
                await addProcess(formData);
            }
            handleCloseModal();
        } catch (error) {
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    const handleDeleteProcess = async (processData) => {
        if (window.confirm("Bu süreci silmek istediğinizden emin misiniz?")) {
            try {
                await deleteProcess(processData.id);
                handleCloseModal();
            } catch (error) {
                alert("Silme işlemi sırasında bir hata oluştu.");
            }
        }
    };

    const handleOpenNewUserModal = () => {
        setIsUserEditMode(false);
        setCurrentUserData(null);
        setIsUserModalOpen(true);
    };

    const handleOpenEditUserModal = (user) => {
        setIsUserEditMode(true);
        setCurrentUserData(user);
        setIsUserModalOpen(true);
    };

    const handleUserSubmit = async (formData) => {
        try {
            if (isUserEditMode) {
                await editUser(formData.id, formData);
            } else {
                await addUser(formData);
            }
            setIsUserModalOpen(false);
        } catch (error) {
            alert("Kullanıcı işlemi sırasında bir hata oluştu.");
        }
    };

    const handleUserDelete = async (user) => {
        if (window.confirm(`${user.fullName} adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) {
            try {
                await removeUser(user.id);
            } catch (error) {
                alert("Kullanıcı silinirken bir hata oluştu.");
            }
        }
    };

    // --- Veri Filtreleme ve Sıralama ---
    const sortedRows = useMemo(() => {
        let sortableItems = dashboardFilter ? processes.filter(row => Object.entries(dashboardFilter).every(([key, value]) => String(row[key]) === String(value))) : [...processes];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [processes, sortConfig, dashboardFilter]);

    const searchFilter = (data, searchTerm) => {
         if (!searchTerm) return data;
         const lowercasedTerm = searchTerm.toLowerCase();
         return data.filter(row => 
            Object.values(row).some(value => 
                String(value).toLowerCase().includes(lowercasedTerm)
            )
         );
    };

    const activeRows = searchFilter(sortedRows.filter(row => row.durum !== 'Tamamlandı'), activeSearch);
    const completedRows = searchFilter(sortedRows.filter(row => row.durum === 'Tamamlandı'), completedSearch);
    const myProcesses = useMemo(() => sortedRows.filter(p => p.sorumlular.includes(user?.fullName)), [sortedRows, user]);
    const isAdmin = user && (user.role === 'Admin' || user.role === 'SuperAdmin');

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Veriler Yükleniyor...</p></div>;
    }

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onTabChange={setActiveTab} activeTab={activeTab} isAdmin={isAdmin} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onTabChange={setActiveTab}
                    activeTab={activeTab}
                    onToggleSidebar={() => setSidebarOpen(true)}
                    onLogout={logout}
                    theme={theme}
                    handleThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    {activeTab === 'dashboard' && <Dashboard processes={processes} users={users} logs={logs} handleGraphClick={(filter) => {setDashboardFilter(filter); setActiveTab('processTable');}} />}

                    {activeTab === 'processTable' && (
                         <div>
                            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                                <button onClick={() => setProcessView('active')} className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors ${processView === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Aktif Süreçler</button>
                                <button onClick={() => setProcessView('completed')} className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors ${processView === 'completed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Tamamlanmış Süreçler</button>
                                <button onClick={handleOpenNewProcessModal} className="ml-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">+ Yeni Süreç</button>
                            </div>
                            {processView === 'active' && <ProcessTable tableRows={activeRows} onEdit={handleOpenEditProcessModal} sortConfig={sortConfig} handleSort={() => {}} userRole={user.role} />}
                            {processView === 'completed' && <ProcessTable tableRows={completedRows} onEdit={handleOpenEditProcessModal} sortConfig={sortConfig} handleSort={() => {}} userRole={user.role} />}
                         </div>
                    )}

                    {activeTab === 'myProcesses' && <ProcessTable tableRows={myProcesses} onEdit={handleOpenEditProcessModal} sortConfig={sortConfig} handleSort={() => {}} userRole={user.role} />}

                    {isAdmin && activeTab === 'admin' && 
                    <AdminPanel 
                        users={users} 
                        firmalar={firmalar} 
                        kategoriler={kategoriler}
                        openUserModal={handleOpenEditUserModal}
                        openNewUserModal={handleOpenNewUserModal}
                        requestUserDelete={handleUserDelete}
                        
                        />
                    }

                </main>
            </div>

            {isProcessModalOpen && 
                <ProcessModal 
                    isOpen={isProcessModalOpen} 
                    onClose={handleCloseModal} 
                    onSubmit={handleProcessSubmit} 
                    isEditMode={isEditMode} 
                    initialData={currentProcessData}
                    onDelete={handleDeleteProcess}
                />
            }

            {isChatOpen && socket &&
                <ChatPanel
                    user={user}
                    allUsers={users}
                    onlineUsers={onlineUsers}
                    messages={messages}
                    socket={socket}
                    unreadCounts={unreadMessages}
                    onUserSelect={(contactId) => setUnreadMessages(prev => ({...prev, [contactId]: 0}))}
                />
            }

            {isUserModalOpen &&
                <UserModal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    onSubmit={handleUserSubmit}
                    isEditMode={isUserEditMode}
                    initialData={currentUserData}
        />
    }

            <button onClick={() => setChatOpen(o => !o)} title="Mesajlaşma" className="fixed bottom-6 right-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-50">
                Sohbet
            </button>
        </div>
    );
};

export default MainLayout;