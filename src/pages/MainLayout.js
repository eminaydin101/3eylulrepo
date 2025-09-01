import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { LoadingOverlay } from '../components/LoadingSpinner';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/Dashboard';
import ProcessTable from '../components/ProcessTable';
import AdminPanel from '../components/AdminPanel';
import ChatPanel from '../components/ChatPanel';
import ProcessModal from '../components/modals/ProcessModal';
import UserModal from '../components/modals/UserModal';
import AdvancedFilter from '../components/AdvancedFilter';
import ExportButton from '../components/ExportButton';
import KanbanBoard from '../components/KanbanBoard';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const { processes, users, firmalar, kategoriler, logs, loading, addProcess, updateProcess, deleteProcess, addUser, editUser, removeUser } = useData();
    const { success, error } = useToast();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const isAdmin = user && (user.role === 'Admin' || user.role === 'SuperAdmin');

    // Process View States
    const [processView, setProcessView] = useState('active');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
    const [sortConfig, setSortConfig] = useState({ key: 'baslangicTarihi', direction: 'descending' });
    const [filters, setFilters] = useState({
        searchTerm: '', 
        firma: 'all', 
        kategori: 'all', 
        sorumlu: 'all',
        durum: 'all',
        oncelik: 'all',
        startDate: '',
        endDate: '',
        controlStartDate: '',
        controlEndDate: ''
    });

    // Modal States
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isProcessEditMode, setIsProcessEditMode] = useState(false);
    const [currentProcessData, setCurrentProcessData] = useState(null);
    const [processModalFocusField, setProcessModalFocusField] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isUserEditMode, setIsUserEditMode] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Table Column Management
    const [tableColumns, setTableColumns] = useState([
        { key: 'id', label: 'ID', required: true },
        { key: 'baslik', label: 'Başlık', required: true },
        { key: 'firma', label: 'Firma', required: false },
        { key: 'durum', label: 'Durum', required: true },
        { key: 'baslangicTarihi', label: 'Başlangıç Tarihi', required: false },
        { key: 'sorumlular', label: 'Sorumlular', required: false }
    ]);

    // Dashboard'dan gelen filtre uygulama
    const handleDashboardFilterApply = (filterType, filterValue) => {
        // Önce processTable sekmesine geç
        setActiveTab('processTable');
        
        // Filter mapping
        const filterMappings = {
            'sorumlu': 'sorumlu',
            'oncelik': 'oncelik', 
            'durum': 'durum',
            'kategori': 'kategori',
            'firma': 'firma',
            'processId': 'searchTerm'
        };

        // Filtreyi uygula
        const mappedFilterType = filterMappings[filterType];
        if (mappedFilterType) {
            if (filterType === 'processId') {
                // Process ID araması için searchTerm kullan
                setFilters(prev => ({ 
                    ...prev, 
                    searchTerm: filterValue 
                }));
            } else if (filterType === 'overdue') {
                // Vadesi geçen süreçler için özel filtreleme
                const today = new Date().toISOString().slice(0, 10);
                setFilters(prev => ({ 
                    ...prev, 
                    controlEndDate: today,
                    durum: 'all' // Aktif süreçleri de göster
                }));
                setProcessView('active');
            } else if (filterType === 'completed_this_week') {
                // Bu hafta tamamlananlar için özel filtreleme
                const today = new Date();
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                setFilters(prev => ({ 
                    ...prev, 
                    startDate: startOfWeek.toISOString().slice(0, 10),
                    endDate: new Date().toISOString().slice(0, 10),
                    durum: 'Tamamlandı'
                }));
                setProcessView('completed');
            } else {
                // Normal filtreleme
                setFilters(prev => ({ 
                    ...prev, 
                    [mappedFilterType]: filterValue 
                }));
            }
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleFilterReset = () => {
        setFilters({
            searchTerm: '', 
            firma: 'all', 
            kategori: 'all', 
            sorumlu: 'all',
            durum: 'all',
            oncelik: 'all',
            startDate: '',
            endDate: '',
            controlStartDate: '',
            controlEndDate: ''
        });
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
        
        // Basic filters
        if (filters.firma !== 'all') items = items.filter(p => p.firma === filters.firma);
        if (filters.kategori !== 'all') items = items.filter(p => p.kategori === filters.kategori);
        if (filters.sorumlu !== 'all') items = items.filter(p => p.sorumlular?.includes(filters.sorumlu));
        if (filters.durum !== 'all') items = items.filter(p => p.durum === filters.durum);
        if (filters.oncelik !== 'all') items = items.filter(p => p.oncelikDuzeyi === filters.oncelik);
        
        // Date filters
        if (filters.startDate) {
            items = items.filter(p => p.baslangicTarihi && p.baslangicTarihi >= filters.startDate);
        }
        if (filters.endDate) {
            items = items.filter(p => p.baslangicTarihi && p.baslangicTarihi <= filters.endDate);
        }
        if (filters.controlStartDate) {
            items = items.filter(p => p.sonrakiKontrolTarihi && p.sonrakiKontrolTarihi >= filters.controlStartDate);
        }
        if (filters.controlEndDate) {
            items = items.filter(p => p.sonrakiKontrolTarihi && p.sonrakiKontrolTarihi <= filters.controlEndDate);
        }
        
        // Search filter
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            items = items.filter(row => 
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(term)
                )
            );
        }
        
        // Sorting
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
    const myProcesses = useMemo(() => filteredAndSortedRows.filter(p => p.sorumlular?.includes(user?.fullName)), [filteredAndSortedRows, user]);

    useEffect(() => { 
        document.documentElement.classList.toggle('dark', theme === 'dark'); 
        localStorage.setItem('theme', theme); 
    }, [theme]);

    // Process Modal Handlers
    const handleOpenNewProcessModal = () => { 
        setIsProcessEditMode(false); 
        setCurrentProcessData(null); 
        setProcessModalFocusField(null);
        setIsProcessModalOpen(true); 
    };
    
    const handleOpenEditProcessModal = (process, focusField = null) => { 
        setIsProcessEditMode(true); 
        setCurrentProcessData(process); 
        setProcessModalFocusField(focusField);
        setIsProcessModalOpen(true); 
    };

    // Process Table Row Click Handler
    const handleProcessTableRowClick = (process, clickedField) => {
        handleOpenEditProcessModal(process, clickedField);
    };
    
    const handleProcessSubmit = async (formData) => { 
        try { 
            if (isProcessEditMode) {
                await updateProcess(formData.id, formData);
                success('Süreç başarıyla güncellendi');
            } else {
                await addProcess(formData);
                success('Yeni süreç başarıyla eklendi');
            }
            setIsProcessModalOpen(false); 
        } catch (err) { 
            error("Süreç işlemi hatası: " + (err.response?.data?.message || err.message));
        }
    };
    
    const handleDeleteProcess = async (processData) => { 
        if (window.confirm("Bu süreci silmek istediğinizden emin misiniz?")) { 
            try { 
                await deleteProcess(processData.id);
                success('Süreç başarıyla silindi');
                setIsProcessModalOpen(false); 
            } catch (err) { 
                error("Silme hatası: " + (err.response?.data?.message || err.message));
            }
        }
    };

    // User Modal Handlers
    const handleOpenNewUserModal = () => { 
        setIsUserEditMode(false); 
        setCurrentUserData(null); 
        setIsUserModalOpen(true); 
    };
    
    const handleOpenEditUserModal = (userToEdit) => { 
        setIsUserEditMode(true); 
        setCurrentUserData(userToEdit); 
        setIsUserModalOpen(true); 
    };
    
    const handleUserSubmit = async (formData) => { 
        try { 
            if (isUserEditMode) {
                await editUser(formData.id, formData);
                success('Kullanıcı başarıyla güncellendi');
            } else {
                await addUser(formData);
                success('Yeni kullanıcı başarıyla eklendi');
            }
            setIsUserModalOpen(false); 
        } catch (err) { 
            error("Kullanıcı işlemi hatası: " + (err.response?.data?.message || err.message));
        }
    };
    
    const handleUserDelete = async (userToDelete) => { 
        if (window.confirm(`${userToDelete.fullName} adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) { 
            try { 
                await removeUser(userToDelete.id);
                success('Kullanıcı başarıyla silindi');
            } catch (err) { 
                error("Kullanıcı silme hatası: " + (err.response?.data?.message || err.message));
            }
        }
    };

    // Kanban için status değiştirme
    const handleStatusChange = async (processId, newStatus) => {
        try {
            const processToUpdate = processes.find(p => p.id === processId);
            if (processToUpdate) {
                const updatedData = { ...processToUpdate, durum: newStatus };
                if (newStatus === 'Tamamlandı' && !processToUpdate.tamamlanmaTarihi) {
                    updatedData.tamamlanmaTarihi = new Date().toISOString().slice(0, 10);
                }
                await updateProcess(processId, updatedData);
            }
        } catch (err) {
            error("Durum güncelleme hatası: " + (err.response?.data?.message || err.message));
            throw err;
        }
    };

    // Category Update Handler for Admin Panel
    const handleCategoryUpdate = async (action, data) => {
        try {
            // API çağrıları buraya gelecek
            switch(action) {
                case 'ADD_CATEGORY':
                    success(`"${data.name}" kategorisi eklendi`);
                    break;
                case 'ADD_SUBCATEGORY':
                    success(`"${data.subCategory}" alt kategorisi eklendi`);
                    break;
                case 'ADD_FIRM':
                    success(`"${data.name}" firması eklendi`);
                    break;
                case 'ADD_LOCATION':
                    success(`"${data.location}" konumu eklendi`);
                    break;
                case 'DELETE_CATEGORY':
                    success(`"${data.name}" kategorisi silindi`);
                    break;
                case 'DELETE_SUBCATEGORY':
                    success(`"${data.subCategory}" alt kategorisi silindi`);
                    break;
                default:
                    break;
            }
        } catch (err) {
            error('İşlem sırasında hata oluştu');
        }
    };

    // Table Columns Update Handler
    const handleTableColumnsUpdate = (newColumns) => {
        setTableColumns(newColumns);
        localStorage.setItem('tableColumns', JSON.stringify(newColumns));
        success('Tablo sütunları güncellendi');
    };

    // Load saved table columns
    useEffect(() => {
        const savedColumns = localStorage.getItem('tableColumns');
        if (savedColumns) {
            try {
                setTableColumns(JSON.parse(savedColumns));
            } catch (error) {
                console.error('Saved columns parse error:', error);
            }
        }
    }, []);

    if (loading) { 
        return <LoadingOverlay isVisible={true} text="Veriler Yükleniyor..." />; 
    }

    const getCurrentTableData = () => {
        if (activeTab === 'myProcesses') return myProcesses;
        if (activeTab === 'processTable') {
            return processView === 'active' ? activeRows : completedRows;
        }
        return [];
    };

    return (
        <div className="h-screen bg-slate-100 dark:bg-slate-900">
            <div className="flex flex-col h-full">
                <Header 
                    onTabChange={setActiveTab} 
                    activeTab={activeTab} 
                    onToggleSidebar={() => setSidebarOpen(true)} 
                    onLogout={logout} 
                    theme={theme} 
                    handleThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
                />
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {activeTab === 'dashboard' && (
                        <Dashboard 
                            processes={processes} 
                            users={users} 
                            logs={logs} 
                            onFilterApply={handleDashboardFilterApply}
                        />
                    )}

                    {(activeTab === 'processTable' || activeTab === 'myProcesses') && (
                        <div>
                            {/* Advanced Filters */}
                            <div className="mb-6">
                                <AdvancedFilter
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onReset={handleFilterReset}
                                    users={users}
                                    firmalar={firmalar}
                                    kategoriler={kategoriler}
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    {activeTab === 'processTable' && (
                                        <>
                                            <button 
                                                onClick={() => setProcessView('active')} 
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg ${processView === 'active' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                Aktif ({activeRows.length})
                                            </button>
                                            <button 
                                                onClick={() => setProcessView('completed')} 
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg ${processView === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                Tamamlanmış ({completedRows.length})
                                            </button>
                                        </>
                                    )}

                                    {activeTab === 'myProcesses' && (
                                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                            Süreçlerim ({myProcesses.length})
                                        </h2>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* View Mode Toggle */}
                                    <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                viewMode === 'table' 
                                                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow' 
                                                : 'text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            📋 Tablo
                                        </button>
                                        <button
                                            onClick={() => setViewMode('kanban')}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                viewMode === 'kanban' 
                                                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow' 
                                                : 'text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            📊 Kanban
                                        </button>
                                    </div>

                                    {/* Export Button */}
                                    <ExportButton 
                                        data={getCurrentTableData()} 
                                        filename={activeTab === 'myProcesses' ? 'benim-sureclerim' : 'tum-surecler'} 
                                    />

                                    {/* New Process Button */}
                                    <button 
                                        onClick={handleOpenNewProcessModal} 
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        ➕ Yeni Süreç
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {viewMode === 'table' ? (
                                <ProcessTable 
                                    tableRows={getCurrentTableData()} 
                                    onEdit={handleOpenEditProcessModal} 
                                    onRowClick={handleProcessTableRowClick}
                                    sortConfig={sortConfig} 
                                    handleSort={requestSort} 
                                    userRole={user.role} 
                                    visibleColumns={tableColumns}
                                />
                            ) : (
                                <KanbanBoard 
                                    processes={getCurrentTableData()} 
                                    onEdit={handleOpenEditProcessModal}
                                    onStatusChange={handleStatusChange}
                                />
                            )}
                        </div>
                    )}

                    {isAdmin && activeTab === 'admin' && (
                        <AdminPanel 
                            users={users} 
                            firmalar={firmalar} 
                            kategoriler={kategoriler} 
                            openUserModal={handleOpenEditUserModal} 
                            openNewUserModal={handleOpenNewUserModal} 
                            requestUserDelete={handleUserDelete}
                            currentTableColumns={tableColumns}
                            onTableColumnsUpdate={handleTableColumnsUpdate}
                            onCategoryUpdate={handleCategoryUpdate}
                        />
                    )}
                </main>
            </div>

            {/* Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                onTabChange={setActiveTab} 
                activeTab={activeTab} 
                isAdmin={isAdmin} 
            />

            {/* Modals */}
            {isProcessModalOpen && (
                <ProcessModal 
                    isOpen={isProcessModalOpen} 
                    onClose={() => setIsProcessModalOpen(false)} 
                    onSubmit={handleProcessSubmit} 
                    isEditMode={isProcessEditMode} 
                    initialData={currentProcessData} 
                    onDelete={handleDeleteProcess}
                    focusField={processModalFocusField}
                />
            )}

            {isUserModalOpen && (
                <UserModal 
                    isOpen={isUserModalOpen} 
                    onClose={() => setIsUserModalOpen(false)} 
                    onSubmit={handleUserSubmit} 
                    isEditMode={isUserEditMode} 
                    initialData={currentUserData} 
                />
            )}

            {/* Chat Panel */}
            {isChatOpen && (
                <ChatPanel 
                    user={user} 
                    allUsers={users} 
                    onUserSelect={() => {}} 
                    onClose={() => setChatOpen(false)} 
                />
            )}

            {/* Floating Chat Button */}
            <button 
                onClick={() => setChatOpen(o => !o)} 
                title="Mesajlaşma" 
                className="fixed bottom-6 right-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-50 transition-colors"
            >
                💬
            </button>

            {/* Loading Overlay */}
            <LoadingOverlay isVisible={isExporting} text="Dışa aktarılıyor..." />
        </div>
    );
};

export default MainLayout;