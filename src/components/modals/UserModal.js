import React, { useState, useEffect } from 'react';

const UserModal = ({ isOpen, onClose, onSubmit, isEditMode, initialData }) => {
    const getEmptyForm = () => ({
        fullName: '',
        email: '',
        password: '',
        role: 'Viewer',
        status: 'Active',
        hint: ''
    });

    const [formData, setFormData] = useState(getEmptyForm());

    useEffect(() => {
        if (isOpen) {
            setFormData(isEditMode && initialData ? { ...initialData, password: '' } : getEmptyForm());
        }
    }, [isEditMode, initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputStyle = "mt-1 block w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600";
    const labelStyle = "text-sm font-medium text-slate-600 dark:text-slate-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{isEditMode ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className={labelStyle}>Ad Soyad</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>E-posta</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Şifre ({isEditMode ? 'Değiştirmek için doldurun' : 'Zorunlu'})</label><input type="password" name="password" value={formData.password} onChange={handleChange} className={inputStyle} required={!isEditMode} /></div>
                    <div><label className={labelStyle}>Rol</label><select name="role" value={formData.role} onChange={handleChange} className={inputStyle}><option>Viewer</option><option>Editor</option><option>Admin</option><option>SuperAdmin</option></select></div>
                    <div><label className={labelStyle}>Durum</label><select name="status" value={formData.status} onChange={handleChange} className={inputStyle}><option>Active</option><option>Inactive</option></select></div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg">İptal</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;