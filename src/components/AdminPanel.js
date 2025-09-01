import React, { useState } from 'react';
import UserManagement from './UserManagement';
import CategoryManager from './admin/CategoryManager';
import TableColumnManager from './admin/TableColumnManager';
import SystemSettings from './admin/SystemSettings';

const AdminPanel = ({ 
    users, 
    firmalar, 
    kategoriler, 
    openUserModal, 
    openNewUserModal, 
    requestUserDelete,
    currentTableColumns,
    onTableColumnsUpdate,
    onCategoryUpdate
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
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{users.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            +{users.filter(u => u.status === 'Active').length} aktif
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Kategori</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(kategoriler).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📂</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            {Object.values(kategoriler).flat().length} alt kategori
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Firma</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(firmalar).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏢</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 dark:text-green-400">
                            {Object.values(firmalar).flat().length} lokasyon
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
            {/* Admin Stats */}
            <AdminStats />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                                📈 Sistem İstatistikleri
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Detaylı sistem istatistikleri yakında gelecek...
                            </p>
                        </div>
                    )}

                    {activeSection === 'logs' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                                📝 Sistem Logları
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Sistem log görüntüleyici yakında gelecek...
                            </p>
                        </div>
                    )}

                    {activeSection === 'backup' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                                💾 Yedekleme Yönetimi
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Yedekleme özellikleri yakında gelecek...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;