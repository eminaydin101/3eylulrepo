import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserManagement from './UserManagement';
import CategoryManager from './admin/CategoryManager';
import TableColumnManager from './admin/TableColumnManager';
import SystemSettings from './admin/SystemSettings';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

const AdminPanel = ({ 
    users, 
    firmalar, 
    kategoriler, 
    processes,
    logs,
    openUserModal, 
    openNewUserModal, 
    requestUserDelete,
    currentTableColumns,
    onTableColumnsUpdate,
    onCategoryUpdate,
    onDatabaseBackup,
    onCleanTempFiles,
    onGenerateSystemReport,
    onClearAllLogs,
    onFactoryReset,
    onExportLogs,
    systemOperationLoading
}) => {
    const [activeSection, setActiveSection] = useState('users');
    const [isLoading, setIsLoading] = useState(false);
    const [backups, setBackups] = useState([]);
    const { success, error } = useToast();
    
    // Prevent automatic section resets
    const sectionLocked = useRef(false);
    const lockTimeout = useRef(null);

    const sections = [
        { id: 'users', label: 'Kullanıcı Yönetimi', icon: '👥' },
        { id: 'categories', label: 'Kategori & Firma', icon: '📂' },
        { id: 'tables', label: 'Tablo Ayarları', icon: '📊' },
        { id: 'system', label: 'Sistem Ayarları', icon: '⚙️' },
        { id: 'statistics', label: 'İstatistikler', icon: '📈' },
        { id: 'logs', label: 'Sistem Logları', icon: '📝' },
        { id: 'backup', label: 'Yedekleme', icon: '💾' }
    ];

    // Section lock mechanism
    const lockSection = useCallback(() => {
        sectionLocked.current = true;
        if (lockTimeout.current) {
            clearTimeout(lockTimeout.current);
        }
        lockTimeout.current = setTimeout(() => {
            sectionLocked.current = false;
        }, 3000); // 3 saniye lock
    }, []);

    const handleSectionChange = useCallback((sectionId) => {
        if (!sectionLocked.current && !systemOperationLoading) {
            setActiveSection(sectionId);
        }
    }, [systemOperationLoading]);

    // Load backups
    const loadBackups = useCallback(async () => {
        try {
            const response = await api.getBackups();
            setBackups(response.data || []);
        } catch (err) {
            console.error('Backup yükleme hatası:', err);
            setBackups([]);
        }
    }, []);

    useEffect(() => {
        if (activeSection === 'backup') {
            loadBackups();
        }
    }, [activeSection, loadBackups]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (lockTimeout.current) {
                clearTimeout(lockTimeout.current);
            }
        };
    }, []);

    const SectionButton = ({ section }) => (
        <button
            onClick={() => handleSectionChange(section.id)}
            disabled={sectionLocked.current || systemOperationLoading}
            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left font-medium transition-colors disabled:opacity-60 ${
                activeSection === section.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
        >
            <span className="text-xl">{section.icon}</span>
            <span>{section.label}</span>
            {sectionLocked.current && activeSection === section.id && (
                <div className="ml-auto w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
        </button>
    );

    // Enhanced operation handlers with locking
    const handleCategoryUpdate = async (action, data) => {
        lockSection();
        try {
            await onCategoryUpdate(action, data);
            success(`Kategori işlemi başarılı: ${action}`);
        } catch (err) {
            error(`Kategori işlemi başarısız: ${err.message}`);
        }
    };

    const handleSystemSettingsChange = () => {
        lockSection();
        success('Sistem ayarları güncellendi');
    };

    const handleDatabaseBackup = async () => {
        lockSection();
        setIsLoading(true);
        try {
            await onDatabaseBackup();
            await loadBackups(); // Refresh backup list
            success('Veritabanı yedeği başarıyla oluşturuldu');
        } catch (err) {
            error('Veritabanı yedeği oluşturulamadı');
        } finally {
            setIsLoading(false);
        }
    };

    // Stats calculation
    const getStats = () => {
        const totalUsers = users?.length || 0;
        const activeUsers = users?.filter(u => u.status === 'Active').length || 0;
        const totalCategories = Object.keys(kategoriler || {}).length;
        const totalCompanies = Object.keys(firmalar || {}).length;
        
        return { totalUsers, activeUsers, totalCategories, totalCompanies };
    };

    const stats = getStats();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Kullanıcı</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalUsers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-green-600 dark:text-green-400 text-sm">
                            {stats.activeUsers} aktif kullanıcı
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Kategoriler</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalCategories}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📂</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Firmalar</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalCompanies}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🏢</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sistem Durumu</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">✅</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">💚</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        ⚙️ Admin Panel
                    </h3>
                    <div className="space-y-2">
                        {sections.map(section => (
                            <SectionButton key={section.id} section={section} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {activeSection === 'users' && (
                        <UserManagement 
                            users={users} 
                            openModal={openUserModal} 
                            openNewModal={openNewUserModal} 
                            requestDelete={requestUserDelete} 
                        />
                    )}

                    {activeSection === 'categories' && (
                        <CategoryManager 
                            kategoriler={kategoriler}
                            firmalar={firmalar}
                            onUpdate={handleCategoryUpdate}
                        />
                    )}

                    {activeSection === 'tables' && (
                        <TableColumnManager 
                            currentColumns={currentTableColumns}
                            onColumnsUpdate={onTableColumnsUpdate}
                        />
                    )}

                    {activeSection === 'system' && (
                        <SystemSettings 
                            onSettingsChange={handleSystemSettingsChange}
                        />
                    )}

                    {activeSection === 'statistics' && (
                        <AdminStatistics processes={processes} users={users} logs={logs} />
                    )}

                    {activeSection === 'logs' && (
                        <SystemLogs 
                            logs={logs} 
                            onExportLogs={onExportLogs}
                            onClearAllLogs={onClearAllLogs}
                            systemOperationLoading={systemOperationLoading}
                        />
                    )}

                    {activeSection === 'backup' && (
                        <BackupManagement 
                            backups={backups}
                            onDatabaseBackup={handleDatabaseBackup}
                            onCleanTempFiles={onCleanTempFiles}
                            onGenerateSystemReport={onGenerateSystemReport}
                            onClearAllLogs={onClearAllLogs}
                            onFactoryReset={onFactoryReset}
                            systemOperationLoading={systemOperationLoading}
                            isLoading={isLoading}
                            onRefreshBackups={loadBackups}
                        />
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            {(systemOperationLoading || isLoading) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    İşlem Devam Ediyor
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                    Lütfen sayfayı kapatmayın...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Basic components for missing imports
const AdminStatistics = ({ processes, users, logs }) => {
    const getPriorityData = () => {
        if (!processes) return [];
        return [
            { name: 'Yüksek', value: processes.filter(p => p.oncelikDuzeyi === 'Yüksek').length, color: '#ef4444' },
            { name: 'Orta', value: processes.filter(p => p.oncelikDuzeyi === 'Orta').length, color: '#f59e0b' },
            { name: 'Normal', value: processes.filter(p => p.oncelikDuzeyi === 'Normal').length, color: '#3b82f6' }
        ];
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">📈 İstatistikler</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Süreç Özeti</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Toplam Süreç:</span>
                            <span className="font-medium">{processes?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Aktif Süreçler:</span>
                            <span className="font-medium text-green-600">
                                {processes?.filter(p => p.durum !== 'Tamamlandı').length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tamamlanan:</span>
                            <span className="font-medium text-blue-600">
                                {processes?.filter(p => p.durum === 'Tamamlandı').length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Öncelik Dağılımı</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={getPriorityData()}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({name, value}) => `${name}: ${value}`}
                            >
                                {getPriorityData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const SystemLogs = ({ logs, onExportLogs, onClearAllLogs, systemOperationLoading }) => {
    const [filter, setFilter] = useState('all');
    const recentLogs = (logs || []).slice(0, 50);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">📝 Sistem Logları</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={onExportLogs}
                        disabled={systemOperationLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                        📥 Dışa Aktar
                    </button>
                    <button 
                        onClick={onClearAllLogs}
                        disabled={systemOperationLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                        🗑️ Temizle
                    </button>
                </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentLogs.length > 0 ? recentLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                {log.userName}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                                {log.field} - #{log.processId}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(log.timestamp).toLocaleString('tr-TR')}
                        </span>
                    </div>
                )) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        Log bulunamadı
                    </div>
                )}
            </div>
        </div>
    );
};

const BackupManagement = ({ 
    backups, 
    onDatabaseBackup, 
    onCleanTempFiles, 
    onGenerateSystemReport, 
    onClearAllLogs, 
    onFactoryReset,
    systemOperationLoading,
    isLoading,
    onRefreshBackups
}) => {
    const { success, error } = useToast();
    const fileInputRef = useRef();

    const handleImportBackup = async (file) => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('backup', file);
            await api.importBackup(formData);
            success('Backup başarıyla import edildi');
            onRefreshBackups();
        } catch (err) {
            error('Backup import hatası: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">💾 Yedekleme Yönetimi</h3>
                    <div className="flex gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && window.confirm(`${file.name} dosyasını import etmek istediğinizden emin misiniz?`)) {
                                    handleImportBackup(file);
                                }
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            📥 Import
                        </button>
                        <button 
                            onClick={onDatabaseBackup} 
                            disabled={isLoading || systemOperationLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? '⏳ Oluşturuluyor...' : '💾 Yeni Yedek'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        Mevcut Yedekler ({backups?.length || 0})
                    </h4>
                    
                    {backups && backups.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {backups.map((backup, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                            {backup.name}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(backup.date).toLocaleString('tr-TR')} - {backup.size}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm px-2 py-1">
                                            📥 İndir
                                        </button>
                                        <button className="text-red-600 hover:text-red-700 text-sm px-2 py-1">
                                            🗑️ Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            Henüz yedek bulunamadı
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button 
                        onClick={onCleanTempFiles}
                        disabled={systemOperationLoading}
                        className="p-4 text-left bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 disabled:opacity-50"
                    >
                        <div className="font-medium text-yellow-800 dark:text-yellow-200">🧹 Geçici Dosyaları Temizle</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-300">Kullanılmayan dosyaları siler</div>
                    </button>

                    <button 
                        onClick={onGenerateSystemReport}
                        disabled={systemOperationLoading}
                        className="p-4 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
                    >
                        <div className="font-medium text-blue-800 dark:text-blue-200">📊 Sistem Raporu</div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">Detaylı sistem analizi</div>
                    </button>

                    <button 
                        onClick={onClearAllLogs}
                        disabled={systemOperationLoading}
                        className="p-4 text-left bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50"
                    >
                        <div className="font-medium text-orange-800 dark:text-orange-200">🗑️ Log Temizle</div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">Tüm log kayıtlarını siler</div>
                    </button>

                    <button 
                        onClick={onFactoryReset}
                        disabled={systemOperationLoading}
                        className="p-4 text-left bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50"
                    >
                        <div className="font-medium text-red-800 dark:text-red-200">🔄 Fabrika Sıfırlama</div>
                        <div className="text-sm text-red-600 dark:text-red-300">TÜM verileri siler (GERİ ALINAMAZ)</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;