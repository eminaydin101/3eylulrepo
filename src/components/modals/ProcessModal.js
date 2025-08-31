import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const ProcessModal = ({ isOpen, onClose, onSubmit, isEditMode, initialData, onDelete }) => {
    const { users, firmalar, kategoriler, logs } = useData();
    const { user } = useAuth();

    const getEmptyForm = () => ({
        id: '', firma: '', konum: '', baslik: '', surec: '', mevcutDurum: '',
        baslangicTarihi: new Date().toISOString().slice(0, 10),
        sonrakiKontrolTarihi: '', tamamlanmaTarihi: '',
        kategori: '', altKategori: '', sorumlular: [],
        durum: 'Aktif', oncelikDuzeyi: 'Normal'
    });

    const [formData, setFormData] = useState(getEmptyForm());

    useEffect(() => {
        if (isOpen) {
            setFormData(isEditMode && initialData ? initialData : getEmptyForm());
        }
    }, [isEditMode, initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSorumlularChange = (e) => setFormData({ ...formData, sorumlular: [...e.target.selectedOptions].map(o => o.value) });
    const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

    const processLogs = isEditMode ? (logs || []).filter(log => log.processId === formData.id) : [];
    const canEdit = user.role === 'Admin' || user.role === 'Editor' || user.role === 'SuperAdmin';
    const canDelete = user.role === 'Admin' || user.role === 'SuperAdmin';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{isEditMode ? 'Süreci Düzenle' : 'Yeni Süreç Ekle'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {/* Form alanları burada... */}
                    </div>

                    {isEditMode && processLogs.length > 0 && (
                        <div className="mt-6 border-t dark:border-slate-700 pt-4">
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Değişiklik Geçmişi</h3>
                            <div className="max-h-40 overflow-y-auto space-y-2 text-xs text-slate-600 dark:text-slate-400 pr-2">
                                {processLogs.map(log => (
                                    <div key={log.id} className="border-b border-slate-100 dark:border-slate-700 pb-1 mb-1">
                                        <p>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{log.userName || 'Bilinmeyen'}</span>
                                            , '{log.field}' alanını güncelledi.
                                            <span className="block text-right text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                        <div>{isEditMode && canDelete && <button type="button" onClick={() => onDelete(formData)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">Süreci Sil</button>}</div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg">İptal</button>
                            {canEdit && <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Kaydet</button>}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProcessModal;