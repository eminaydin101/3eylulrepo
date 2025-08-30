import React from 'react';

const UserManagement = ({ users, openModal, openNewModal, requestDelete }) => {
    const thStyle = "p-3 text-left text-xs font-semibold text-white uppercase tracking-wider bg-slate-700 dark:bg-slate-800 border-r border-slate-600 dark:border-slate-700 last:border-r-0";
    const tdStyle = "p-3 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300";

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Kullanıcı Yönetimi</h3>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm">
                    + Yeni Kullanıcı Ekle
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg shadow-inner border border-slate-200 dark:border-slate-700">
                <table className="min-w-full">
                    <thead className="sticky top-0 bg-slate-700 dark:bg-slate-800">
                        <tr>
                            <th className={thStyle}>Ad Soyad</th>
                            <th className={thStyle}>E-posta</th>
                            <th className={thStyle}>Rol</th>
                            <th className={thStyle}>Durum</th>
                            <th className={thStyle}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className={`${tdStyle} font-medium`}>{u.fullName}</td>
                                <td className={tdStyle}>{u.email}</td>
                                <td className={tdStyle}>{u.role}</td>
                                <td className={tdStyle}>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-100 text-slate-800'}`}>
                                        {u.status === 'Active' ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className={`${tdStyle} space-x-4`}>
                                    <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-medium">Düzenle</button>
                                    <button onClick={() => requestDelete(u)} className="text-red-600 hover:text-red-800 font-medium">Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;