import React from 'react';
import UserManagement from './UserManagement';

const AdminPanel = ({ firmalar, kategoriler, users, openUserModal, requestUserDelete }) => {
    const handleUpdateFirmsOrCategories = () => {
        alert("Bu özellik için backend'in güncellenmesi gerekmektedir.");
    };

    const sectionStyle = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700";
    const inputGroupStyle = "flex items-center gap-2 mb-3 flex-wrap";
    const inputStyle = "flex-1 min-w-[150px] p-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700";
    const addButton = "bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-slate-400";

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
            <div className="mb-6">
                <UserManagement 
                    users={users} 
                    openModal={openUserModal} 
                    openNewModal={openNewUserModal} 
                    requestDelete={requestUserDelete} 
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className={sectionStyle}>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Firma & Konum Yönetimi</h3>
                    <div className={inputGroupStyle}>
                        <input type="text" placeholder="Yeni Firma Adı" className={inputStyle} />
                        <button onClick={handleUpdateFirmsOrCategories} className={addButton}>Ekle</button>
                    </div>
                </div>
                <div className={sectionStyle}>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Kategori Yönetimi</h3>
                    <div className={inputGroupStyle}>
                        <input type="text" placeholder="Yeni Kategori Adı" className={inputStyle} />
                        <button onClick={handleUpdateFirmsOrCategories} className={addButton}>Ekle</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;