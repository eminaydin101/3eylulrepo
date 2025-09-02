import React, { useState } from 'react';
import UserManagement from './UserManagement';
import CategoryManager from './admin/CategoryManager';
import TableColumnManager from './admin/TableColumnManager';
import SystemSettings from './admin/SystemSettings';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

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

    const sections = [
        { id: 'users', label: 'Kullanıcı Yönetimi', icon: '👥' },
        { id: 'categories', label: 'Kategori & Firma', icon: '📂' },
        { id: 'tables', label: 'Tablo Ayarları', icon: '📊' },
        { id: 'system', label: 'Sistem Ayarları', icon: '⚙️' },
        { id: 'statistics', label: 'İstatistikler', icon: '📈' },
        { id: 'logs', label: 'Sistem Logları', icon: '📝' },
        { id: 'backup', label: 'Yedekleme', icon: '💾' }
    ];

    const SectionButton = ({ section }) => (
        <button
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left font-medium transition-colors ${
                activeSection === section.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
        >
            <span className="text-xl">{section.icon}</span>
            <span>{section.label}</span>
        </button>
    );

    const AdminStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Kullanıcı</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{users?.length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            +{users?.filter(u => u.status === 'Active').length || 0} aktif
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Kategori</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(kategoriler || {}).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📂</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            {Object.values(kategoriler || {}).flat().length} alt kategori
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Firma</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(firmalar || {}).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏢</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            {Object.values(firmalar || {}).flat().length} lokasyon
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sistem Sağlığı</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">98%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💚</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            Tüm sistemler çalışıyor
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <AdminStats />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                            onUpdate={onCategoryUpdate}
                        />
                    )}

                    {activeSection === 'tables' && (
                        <TableColumnManager 
                            currentColumns={currentTableColumns}
                            onColumnsUpdate={onTableColumnsUpdate}
                        />
                    )}

                    {activeSection === 'system' && (
                        <SystemSettings />
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
                            onDatabaseBackup={onDatabaseBackup}
                            onCleanTempFiles={onCleanTempFiles}
                            onGenerateSystemReport={onGenerateSystemReport}
                            onClearAllLogs={onClearAllLogs}
                            onFactoryReset={onFactoryReset}
                            systemOperationLoading={systemOperationLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminStatistics = ({ processes, users, logs }) => {
    const [dateRange, setDateRange] = useState('7');

    const totalProcesses = processes?.length || 0;
    const activeProcesses = processes?.filter(p => p.durum !== 'Tamamlandı').length || 0;
    const completedProcesses = processes?.filter(p => p.durum === 'Tamamlandı').length || 0;
    const overdueProcesses = processes?.filter(p => 
        p.sonrakiKontrolTarihi && new Date(p.sonrakiKontrolTarihi) < new Date() && p.durum !== 'Tamamlandı'
    ).length || 0;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const completedThisMonth = processes?.filter(p => {
        if (!p.tamamlanmaTarihi) return false;
        const date = new Date(p.tamamlanmaTarihi);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length || 0;

    const getLast30DaysData = () => {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayLogs = logs?.filter(log => {
                const logDate = new Date(log.timestamp).toISOString().split('T')[0];
                return logDate === dateString;
            }).length || 0;

            const dayCompleted = processes?.filter(p => 
                p.tamamlanmaTarihi === dateString
            ).length || 0;

            data.push({
                date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                aktivite: dayLogs,
                tamamlanan: dayCompleted
            });
        }
        return data;
    };

    const getUserProcessData = () => {
        if (!users || !processes) return [];
        return users.map(user => {
            const userProcesses = processes.filter(p => 
                p.sorumlular && p.sorumlular.includes(user.fullName)
            );
            return {
                name: user.fullName.split(' ')[0],
                aktif: userProcesses.filter(p => p.durum !== 'Tamamlandı').length,
                tamamlanan: userProcesses.filter(p => p.durum === 'Tamamlandı').length,
                toplam: userProcesses.length
            };
        }).filter(user => user.toplam > 0).slice(0, 10);
    };

    const getPriorityData = () => {
        if (!processes) return [];
        return [
            { name: 'Yüksek', value: processes.filter(p => p.oncelikDuzeyi === 'Yüksek').length, color: '#ef4444' },
            { name: 'Orta', value: processes.filter(p => p.oncelikDuzeyi === 'Orta').length, color: '#f59e0b' },
            { name: 'Normal', value: processes.filter(p => p.oncelikDuzeyi === 'Normal').length, color: '#3b82f6' }
        ];
    };

    const getCategoryData = () => {
        if (!processes) return [];
        const categories = {};
        processes.forEach(p => {
            categories[p.kategori] = (categories[p.kategori] || 0) + 1;
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    };

    const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
        <div className="card-modern p-6 hover-lift">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
                    <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                    {change && (
                        <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                            {change > 0 ? '↗️' : '↘️'} {Math.abs(change)}%
                        </p>
                    )}
                </div>
                <div className={`w-16 h-16 bg-${color}-100 dark:bg-${color}-900/20 rounded-2xl flex items-center justify-center text-3xl hover-glow`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold heading-modern">📈 Sistem İstatistikleri</h3>
                <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="input-modern w-auto"
                >
                    <option value="7">Son 7 Gün</option>
                    <option value="30">Son 30 Gün</option>
                    <option value="90">Son 90 Gün</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Toplam Süreç" 
                    value={totalProcesses} 
                    change={12}
                    icon="📊" 
                    color="blue"
                />
                <StatCard 
                    title="Aktif Süreçler" 
                    value={activeProcesses} 
                    change={-3}
                    icon="🔄" 
                    color="green"
                />
                <StatCard 
                    title="Bu Ay Tamamlanan" 
                    value={completedThisMonth} 
                    change={25}
                    icon="✅" 
                    color="emerald"
                />
                <StatCard 
                    title="Geciken Süreçler" 
                    value={overdueProcesses} 
                    change={-8}
                    icon="⚠️" 
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-modern p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        📈 Son 30 Günlük Aktivite
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={getLast30DaysData()}>
                            <defs>
                                <linearGradient id="colorAktivite" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorTamamlanan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'rgba(255, 255, 255, 0.95)', 
                                    border: 'none', 
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Area type="monotone" dataKey="aktivite" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAktivite)" />
                            <Area type="monotone" dataKey="tamamlanan" stroke="#10b981" fillOpacity={1} fill="url(#colorTamamlanan)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card-modern p-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        ⚡ Öncelik Dağılımı
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={getPriorityData()}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
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

            <div className="card-modern p-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    👥 Kullanıcı Performansı (Top 10)
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getUserProcessData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                            contentStyle={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                border: 'none', 
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey="aktif" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="tamamlanan" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card-modern p-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    📂 Kategori Dağılımı
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getCategoryData()} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" />
                        <YAxis dataKey="name" type="category" stroke="#64748b" width={100} />
                        <Tooltip 
                            contentStyle={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                border: 'none', 
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SystemLogs = ({ logs, onExportLogs, onClearAllLogs, systemOperationLoading }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredLogs = (logs || []).filter(log => {
        const matchesFilter = filter === 'all' || log.field === filter;
        const matchesSearch = !searchTerm || 
            log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.processId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.field?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);
        
        return matchesFilter && matchesSearch && matchesDate;
    }).slice(0, 100);

    const getLogIcon = (field) => {
        const icons = {
            'Oluşturma': '🆕',
            'durum': '🔄',
            'oncelikDuzeyi': '⚡',
            'sonrakiKontrolTarihi': '📅',
            'tamamlanmaTarihi': '✅',
            'mevcutDurum': '📝',
            'sorumlular': '👥',
            'baslik': '📌',
            'Silme': '🗑️'
        };
        return icons[field] || '📝';
    };

    const getLogColor = (field) => {
        const colors = {
            'Oluşturma': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            'durum': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            'Silme': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            'oncelikDuzeyi': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        };
        return colors[field] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold heading-modern">📝 Sistem Logları</h3>
                <div className="flex gap-3">
                    <button 
                        onClick={onExportLogs}
                        disabled={systemOperationLoading}
                        className="btn-secondary text-sm disabled:opacity-50"
                    >
                        📥 Dışa Aktar
                    </button>
                    <button 
                        onClick={onClearAllLogs}
                        disabled={systemOperationLoading}
                        className="btn-danger text-sm disabled:opacity-50"
                    >
                        🗑️ Temizle
                    </button>
                </div>
            </div>

            <div className="card-modern p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            İşlem Türü
                        </label>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="input-modern"
                        >
                            <option value="all">Tümü</option>
                            <option value="Oluşturma">Oluşturma</option>
                            <option value="durum">Durum Değişikliği</option>
                            <option value="Silme">Silme</option>
                            <option value="oncelikDuzeyi">Öncelik Değişikliği</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Arama
                        </label>
                        <input
                            type="text"
                            placeholder="Kullanıcı, süreç ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-modern"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tarih
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="input-modern"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => {
                                setFilter('all');
                                setSearchTerm('');
                                setDateFilter('');
                            }}
                            className="btn-secondary w-full"
                        >
                            🔄 Sıfırla
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-modern overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                    {filteredLogs.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredLogs.map((log, index) => (
                                <div key={log.id || index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-slide-up">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{getLogIcon(log.field)}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {log.userName}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogColor(log.field)}`}>
                                                    {log.field}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    #{log.processId}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                <strong>{log.field}</strong> alanında değişiklik yaptı
                                            </p>
                                            {log.oldValue && log.newValue && (
                                                <div className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <span className="text-red-600 dark:text-red-400 font-medium">Eski:</span>
                                                            <p className="text-slate-600 dark:text-slate-400 truncate">
                                                                {log.oldValue.length > 30 ? log.oldValue.substring(0, 30) + '...' : log.oldValue}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-600 dark:text-green-400 font-medium">Yeni:</span>
                                                            <p className="text-slate-600 dark:text-slate-400 truncate">
                                                                {log.newValue.length > 30 ? log.newValue.substring(0, 30) + '...' : log.newValue}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(log.timestamp).toLocaleString('tr-TR', {
                                                        timeZone: 'Europe/Istanbul'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <div className="text-4xl mb-2">📝</div>
                            <p>Filtreye uygun log bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BackupManagement = ({ 
    onDatabaseBackup, 
    onCleanTempFiles, 
    onGenerateSystemReport, 
    onClearAllLogs, 
    onFactoryReset, 
    systemOperationLoading 
}) => {
    const [backups, setBackups] = useState([
        { id: 1, name: 'Otomatik Yedek - 15.01.2025', date: '2025-01-15T10:30:00', size: '2.3 MB', type: 'auto' },
        { id: 2, name: 'Manuel Yedek - 14.01.2025', date: '2025-01-14T16:45:00', size: '2.1 MB', type: 'manual' },
        { id: 3, name: 'Otomatik Yedek - 13.01.2025', date: '2025-01-13T10:30:00', size: '2.2 MB', type: 'auto' }
    ]);

    const createBackup = () => {
        const newBackup = {
            id: Date.now(),
            name: `Manuel Yedek - ${new Date().toLocaleDateString('tr-TR')}`,
            date: new Date().toISOString(),
            size: '2.4 MB',
            type: 'manual'
        };
        setBackups([newBackup, ...backups]);
        onDatabaseBackup();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold heading-modern">💾 Yedekleme Yönetimi</h3>
                <button 
                    onClick={createBackup} 
                    disabled={systemOperationLoading}
                    className="btn-primary disabled:opacity-50"
                >
                    💾 Yeni Yedek Oluştur
                </button>
            </div>

            <div className="card-modern p-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    ⚙️ Otomatik Yedekleme Ayarları
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Yedekleme Sıklığı
                        </label>
                        <select className="input-modern">
                            <option>Günlük</option>
                            <option>Haftalık</option>
                            <option>Aylık</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Saklama Süresi
                        </label>
                        <select className="input-modern">
                            <option>30 Gün</option>
                            <option>90 Gün</option>
                            <option>1 Yıl</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Maksimum Yedek Sayısı
                        </label>
                        <input type="number" defaultValue="10" className="input-modern" />
                    </div>
                </div>
            </div>

            <div className="card-modern p-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    📋 Mevcut Yedekler
                </h4>
                <div className="space-y-3">
                    {backups.map(backup => (
                        <div key={backup.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover-lift">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                    {backup.type === 'auto' ? '🤖' : '👤'}
                                </span>
                                <div>
                                    <h5 className="font-medium text-slate-800 dark:text-slate-200">
                                        {backup.name}
                                    </h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(backup.date).toLocaleString('tr-TR', {
                                            timeZone: 'Europe/Istanbul'
                                        })} • {backup.size}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="btn-secondary text-sm">
                                    📥 İndir
                                </button>
                                <button className="btn-primary text-sm">
                                    🔄 Geri Yükle
                                </button>
                                <button 
                                    onClick={() => setBackups(backups.filter(b => b.id !== backup.id))}
                                    className="btn-danger text-sm"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className={`card-modern p-6`}>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                        ⚡ Gelişmiş Ayarlar
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300">🗄️ Veritabanı</h4>
                            <div className="space-y-2">
                                <button 
                                    onClick={onDatabaseBackup}
                                    disabled={systemOperationLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-3 rounded-lg font-medium transition-colors"
                                >
                                    💾 Veritabanı Yedeği Al
                                </button>
                                <button 
                                    onClick={onCleanTempFiles}
                                    disabled={systemOperationLoading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white p-3 rounded-lg font-medium transition-colors"
                                >
                                    🧹 Geçici Dosyaları Temizle
                                </button>
                                <button 
                                    onClick={onGenerateSystemReport}
                                    disabled={systemOperationLoading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white p-3 rounded-lg font-medium transition-colors"
                                >
                                    📊 Sistem Raporunu Oluştur
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300">⚠️ Tehlikeli İşlemler</h4>
                            <div className="space-y-2">
                                <button 
                                    onClick={onClearAllLogs}
                                    disabled={systemOperationLoading}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white p-3 rounded-lg font-medium transition-colors"
                                >
                                    🗑️ Tüm Log Kayıtlarını Temizle
                                </button>
                                <button 
                                    onClick={onFactoryReset}
                                    disabled={systemOperationLoading}
                                    className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-400 text-white p-3 rounded-lg font-medium transition-colors"
                                >
                                    ⚠️ Sistemi Fabrika Ayarlarına Sıfırla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-modern p-6 text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">Toplam Yedek</h5>
                    <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
                </div>
                <div className="card-modern p-6 text-center">
                    <div className="text-3xl mb-2">💾</div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">Toplam Boyut</h5>
                    <p className="text-2xl font-bold text-green-600">
                        {(backups.reduce((total, backup) => total + parseFloat(backup.size), 0)).toFixed(1)} MB
                    </p>
                </div>
                <div className="card-modern p-6 text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">Son Yedek</h5>
                    <p className="text-2xl font-bold text-purple-600">
                        {backups.length > 0 ? new Date(backups[0].date).toLocaleDateString('tr-TR') : 'Hiç'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;