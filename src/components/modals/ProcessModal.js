import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const ProcessModal = ({ isOpen, onClose, onSubmit, isEditMode, initialData, onDelete }) => {
    const { users, firmalar, kategoriler, logs } = useData();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    id: '', firma: '', konum: '', baslik: '', surec: '', mevcutDurum: '',
                    baslangicTarihi: new Date().toISOString().slice(0, 10),
                    sonrakiKontrolTarihi: '', tamamlanmaTarihi: '',
                    kategori: '', altKategori: '', sorumlular: [],
                    durum: 'Aktif', oncelikDuzeyi: 'Normal'
                });
            }
        }
    }, [isEditMode, initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSorumlularChange = (e) => {
        const values = [...e.target.selectedOptions].map(opt => opt.value);
        handleChange('sorumlular', values);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{isEditMode ? 'Süreci Düzenle' : 'Yeni Süreç Ekle'}</h2>
                    <button onClick={onClose} className="text-slate-500 text-2xl hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-1">
                        <div><label>Başlık</label><input type="text" value={formData.baslik || ''} onChange={e => handleChange('baslik', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" required /></div>
                        <div><label>Firma</label><select value={formData.firma || ''} onChange={e => handleChange('firma', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" required><option value="">Seçiniz</option>{Object.keys(firmalar).map(f => <option key={f}>{f}</option>)}</select></div>
                        <div><label>Konum</label><select value={formData.konum || ''} onChange={e => handleChange('konum', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" disabled={!formData.firma} required><option value="">Seçiniz</option>{(firmalar[formData.firma] || []).map(k => <option key={k}>{k}</option>)}</select></div>
                        <div><label>Kategori</label><select value={formData.kategori || ''} onChange={e => handleChange('kategori', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" required><option value="">Seçiniz</option>{Object.keys(kategoriler).map(k => <option key={k}>{k}</option>)}</select></div>
                        <div><label>Alt Kategori</label><select value={formData.altKategori || ''} onChange={e => handleChange('altKategori', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" disabled={!formData.kategori} required><option value="">Seçiniz</option>{(kategoriler[formData.kategori] || []).map(ak => <option key={ak}>{ak}</option>)}</select></div>
                        <div><label>Sorumlular</label><select multiple value={formData.sorumlular || []} onChange={handleSorumlularChange} className="mt-1 block w-full p-2 border rounded-lg h-24">{users.map(u => <option key={u.id}>{u.fullName}</option>)}</select></div>
                        <div className="md:col-span-3"><label>Süreç Açıklaması</label><textarea value={formData.surec || ''} onChange={e => handleChange('surec', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" rows="3"></textarea></div>
                        <div className="md:col-span-3"><label>Mevcut Durum</label><textarea value={formData.mevcutDurum || ''} onChange={e => handleChange('mevcutDurum', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" rows="3"></textarea></div>
                        <div><label>Başlangıç Tarihi</label><input type="date" value={formData.baslangicTarihi || ''} onChange={e => handleChange('baslangicTarihi', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" /></div>
                        <div><label>Sonraki Kontrol</label><input type="date" value={formData.sonrakiKontrolTarihi || ''} onChange={e => handleChange('sonrakiKontrolTarihi', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" /></div>
                        <div><label>Tamamlanma Tarihi</label><input type="date" value={formData.tamamlanmaTarihi || ''} onChange={e => handleChange('tamamlanmaTarihi', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg" /></div>
                        <div><label>Öncelik</label><select value={formData.oncelikDuzeyi || 'Normal'} onChange={e => handleChange('oncelikDuzeyi', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg"><option>Normal</option><option>Orta</option><option>Yüksek</option></select></div>
                        <div><label>Durum</label><select value={formData.durum || 'Aktif'} onChange={e => handleChange('durum', e.target.value)} className="mt-1 block w-full p-2 border rounded-lg"><option>Aktif</option><option>İşlemde</option><option>Tamamlandı</option></select></div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <div>{isEditMode && <button type="button" onClick={() => onDelete(formData)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">Süreci Sil</button>}</div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg">İptal</button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Kaydet</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProcessModal;