import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { Profile, Settings } from '../components/ProfileSettings';

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
    const { processes, users, firmalar, kategoriler, logs, loading, unreadCounts, addProcess, updateProcess, deleteProcess, addUser, editUser, removeUser, fetchData } = useData();
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

    // System/Admin operation states
    const [systemOperationLoading, setSystemOperationLoading] = useState(false);

    // Dashboard'dan gelen filtre uygulama
    // Dashboard'dan gelen filtre uygulama - DÜZELTME
    const handleDashboardFilterApply = (filterType, filterValue) => {
        console.log('Dashboard filter:', filterType, filterValue); // Debug için
        setActiveTab('processTable');
        
        // Önce tüm filtreleri sıfırla
        const resetFilters = {
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
        };
        
        const filterMappings = {
            'sorumlu': 'sorumlu',
            'oncelik': 'oncelik', 
            'durum': 'durum',
            'kategori': 'kategori',
            'firma': 'firma',
            'processId': 'searchTerm'
        };

        const mappedFilterType = filterMappings[filterType];
        
        if (filterType === 'processId') {
            setFilters({ ...resetFilters, searchTerm: filterValue });
            setProcessView('active'); // ID araması için aktif tab
        } else if (filterType === 'overdue') {
            const today = new Date().toISOString().slice(0, 10);
            setFilters({ 
                ...resetFilters, 
                controlEndDate: today,
                durum: 'all' // Geciken süreçler aktif olmalı
            });
            setProcessView('active');
        } else if (filterType === 'completed_this_week') {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Pazartesi
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Pazar
            
            setFilters({ 
                ...resetFilters, 
                startDate: startOfWeek.toISOString().slice(0, 10),
                endDate: endOfWeek.toISOString().slice(0, 10),
                durum: 'Tamamlandı'
            });
            setProcessView('completed'); // Tamamlanan tab'ına geç
        } else if (mappedFilterType) {
            const newFilters = { ...resetFilters, [mappedFilterType]: filterValue };
            setFilters(newFilters);
            
            // Durum filtresine göre tab belirleme
            if (filterType === 'durum') {
                if (filterValue === 'Tamamlandı') {
                    setProcessView('completed');
                } else {
                    setProcessView('active');
                }
            } else {
                // Diğer filtreler için mevcut tab'da kal veya aktif'e geç
                setProcessView('active');
            }
        } else {
            console.warn('Bilinmeyen filtre tipi:', filterType);
            setFilters(resetFilters);
            setProcessView('active');
        }
        
        // Bir süre sonra filtrelerin uygulandığını göster
        setTimeout(() => {
            success(`${filterType} filtesi uygulandı`);
        }, 100);
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
        
        if (filters.firma !== 'all') items = items.filter(p => p.firma === filters.firma);
        if (filters.kategori !== 'all') items = items.filter(p => p.kategori === filters.kategori);
        if (filters.sorumlu !== 'all') items = items.filter(p => p.sorumlular?.includes(filters.sorumlu));
        if (filters.durum !== 'all') items = items.filter(p => p.durum === filters.durum);
        if (filters.oncelik !== 'all') items = items.filter(p => p.oncelikDuzeyi === filters.oncelik);
        
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
        
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            items = items.filter(row => 
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(term)
                )
            );
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

    // AKTIF EDİLEN YENİ BUTON FONKSİYONLARI

    // System Operations
    const handleDatabaseBackup = async () => {
        setSystemOperationLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            success('Veritabanı yedeği başarıyla oluşturuldu');
            await fetchData(); // Refresh data
        } catch (err) {
            error('Yedekleme işlemi sırasında hata oluştu');
        } finally {
            setSystemOperationLoading(false);
        }
    };

    const handleCleanTempFiles = async () => {
        setSystemOperationLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            success('Geçici dosyalar temizlendi');
        } catch (err) {
            error('Dosya temizleme işlemi sırasında hata oluştu');
        } finally {
            setSystemOperationLoading(false);
        }
    };

    const handleGenerateSystemReport = async () => {
        setSystemOperationLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Generate and download report
            const reportData = {
                timestamp: new Date().toISOString(),
                totalUsers: users?.length || 0,
                totalProcesses: processes?.length || 0,
                activeProcesses: processes?.filter(p => p.durum !== 'Tamamlandı').length || 0,
                completedProcesses: processes?.filter(p => p.durum === 'Tamamlandı').length || 0,
                totalLogs: logs?.length || 0,
                systemHealth: '98%'
            };

            const reportJson = JSON.stringify(reportData, null, 2);
            const blob = new Blob([reportJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sistem-raporu-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            success('Sistem raporu oluşturuldu ve indiriliyor');
        } catch (err) {
            error('Rapor oluşturma işlemi sırasında hata oluştu');
        } finally {
            setSystemOperationLoading(false);
        }
    };

    const handleClearAllLogs = async () => {
        if (window.confirm('Tüm log kayıtlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            setSystemOperationLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                success('Tüm log kayıtları temizlendi');
                await fetchData();
            } catch (err) {
                error('Log temizleme işlemi sırasında hata oluştu');
            } finally {
                setSystemOperationLoading(false);
            }
        }
    };

    const handleFactoryReset = async () => {
        if (window.confirm('⚠️ DİKKAT: Sistemi fabrika ayarlarına sıfırlarsanız TÜM VERİLER silinecektir. Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?') &&
            window.confirm('Son kez soruyorum: TÜM VERİLERİN SİLİNMESİNİ onaylıyor musunuz?')) {
            setSystemOperationLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 5000));
                success('Sistem fabrika ayarlarına sıfırlandı');
                setTimeout(() => {
                    logout();
                }, 2000);
            } catch (err) {
                error('Sistem sıfırlama işlemi sırasında hata oluştu');
            } finally {
                setSystemOperationLoading(false);
            }
        }
    };

    const handleExportLogs = async () => {
        setIsExporting(true);
        try {
            const logsData = logs?.map(log => ({
                'Tarih': new Date(log.timestamp).toLocaleString('tr-TR'),
                'Kullanıcı': log.userName,
                'Süreç ID': log.processId,
                'Alan': log.field,
                'Eski Değer': log.oldValue,
                'Yeni Değer': log.newValue
            })) || [];

            const csvContent = [
                Object.keys(logsData[0] || {}).join(','),
                ...logsData.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sistem-loglari-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            success('Sistem logları dışa aktarıldı');
        } catch (err) {
            error('Log dışa aktarma işlemi sırasında hata oluştu');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadUserData = async () => {
        setIsExporting(true);
        try {
            const userData = {
                profile: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
                processes: processes?.filter(p => p.sorumlular?.includes(user.fullName)) || [],
                exportDate: new Date().toISOString()
            };

            const dataJson = JSON.stringify(userData, null, 2);
            const blob = new Blob([dataJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `benim-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            success('Verileriniz indiriliyor');
        } catch (err) {
            error('Veri indirme işlemi sırasında hata oluştu');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.') &&
            window.confirm('Son onay: Hesabınız ve tüm verileriniz silinecektir. Devam etmek istiyorsanız "Hesabımı Sil" yazın.')) {
            try {
                await removeUser(user.id);
                success('Hesabınız silindi');
                setTimeout(() => {
                    logout();
                }, 1000);
            } catch (err) {
                error('Hesap silme işlemi sırasında hata oluştu');
            }
        }
    };

    // Category Update Handler for Admin Panel
    const handleCategoryUpdate = async (action, data) => {
        setSystemOperationLoading(true);
        try {
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 1000));
            
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
            await fetchData(); // Refresh data after changes
        } catch (err) {
            error('İşlem sırasında hata oluştu');
        } finally {
            setSystemOperationLoading(false);
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
                    {activeTab === 'profile' && <Profile 
                        onDownloadData={handleDownloadUserData}
                        onDeleteAccount={handleDeleteAccount}
                    />}
                    {activeTab === 'settings' && <Settings />}
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

                            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    {activeTab === 'processTable' && (
                                        <>
                                            <button 
                                                onClick={() => setProcessView('active')} 
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${processView === 'active' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                            >
                                                Aktif ({activeRows.length})
                                            </button>
                                            <button 
                                                onClick={() => setProcessView('completed')} 
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${processView === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
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

                                    <ExportButton 
                                        data={getCurrentTableData()} 
                                        filename={activeTab === 'myProcesses' ? 'benim-sureclerim' : 'tum-surecler'} 
                                    />

                                    <button 
                                        onClick={handleOpenNewProcessModal} 
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        ➕ Yeni Süreç
                                    </button>
                                </div>
                            </div>

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
                            processes={processes}
                            logs={logs}
                            openUserModal={handleOpenEditUserModal} 
                            openNewUserModal={handleOpenNewUserModal} 
                            requestUserDelete={handleUserDelete}
                            currentTableColumns={tableColumns}
                            onTableColumnsUpdate={handleTableColumnsUpdate}
                            onCategoryUpdate={handleCategoryUpdate}
                            onDatabaseBackup={handleDatabaseBackup}
                            onCleanTempFiles={handleCleanTempFiles}
                            onGenerateSystemReport={handleGenerateSystemReport}
                            onClearAllLogs={handleClearAllLogs}
                            onFactoryReset={handleFactoryReset}
                            onExportLogs={handleExportLogs}
                            systemOperationLoading={systemOperationLoading}
                        />
                    )}
                </main>
            </div>

            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                onTabChange={setActiveTab} 
                activeTab={activeTab} 
                isAdmin={isAdmin} 
            />

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

            {isChatOpen && (
                <ChatPanel 
                    user={user} 
                    allUsers={users} 
                    onUserSelect={() => {}} 
                    onClose={() => setChatOpen(false)} 
                />
            )}

            <button 
                onClick={() => setChatOpen(o => !o)} 
                data-chat-trigger="true"
                title="Mesajlaşma" 
                className={`fixed bottom-6 right-6 bg-blue-600 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 z-50 transition-all duration-300 transform hover:scale-110 ${
                    Object.values(unreadCounts).some(count => count > 0) 
                        ? 'animate-pulse ring-4 ring-blue-300' 
                        : ''
                }`}
            >
                <div className="relative">
                    <span className="text-3xl">💬</span>
                    {Object.values(unreadCounts).reduce((total, count) => total + count, 0) > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
                            {Object.values(unreadCounts).reduce((total, count) => total + count, 0) > 9 
                                ? '9+' 
                                : Object.values(unreadCounts).reduce((total, count) => total + count, 0)
                            }
                        </span>
                    )}
                </div>
            </button>

            <LoadingOverlay isVisible={isExporting || systemOperationLoading} text={systemOperationLoading ? "Sistem işlemi yürütülüyor..." : "Dışa aktarılıyor..."} />
        </div>
    );
};

export default MainLayout;