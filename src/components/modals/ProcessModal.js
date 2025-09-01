import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const ProcessModal = ({ isOpen, onClose, onSubmit, isEditMode, initialData, onDelete }) => {
    const { users, firmalar, kategoriler, logs } = useData();
    const { user } = useAuth();

    const getEmptyForm = () => ({
        id: '', 
        firma: '', 
        konum: '', 
        baslik: '', 
        surec: '', 
        mevcutDurum: '',
        baslangicTarihi: new Date().toISOString().slice(0, 10),
        sonrakiKontrolTarihi: '', 
        tamamlanmaTarihi: '',
        kategori: '', 
        altKategori: '', 
        sorumlular: [],
        durum: 'Aktif', 
        oncelikDuzeyi: 'Normal'
    });

    const [formData, setFormData] = useState(getEmptyForm());

    useEffect(() => {
        if (isOpen) {
            setFormData(isEditMode && initialData ? initialData : getEmptyForm());
        }
    }, [isEditMode, initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSorumlularChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, sorumlular: selectedOptions });
    };

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        onSubmit(formData); 
    };

    const processLogs = isEditMode ? (logs || []).filter(log => log.processId === formData.id) : [];
    const canEdit = user.role === 'Admin' || user.role === 'Editor' || user.role === 'SuperAdmin';
    const canDelete = user.role === 'Admin' || user.role === 'SuperAdmin';

    const inputStyle = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    // Firma değiştiğinde konumları güncelle
    const availableLocations = firmalar[formData.firma] || [];
    const availableSubCategories = kategoriler[formData.kategori] || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                    {isEditMode ? 'Süreci Düzenle' : 'Yeni Süreç Ekle'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* ID - sadece edit modunda göster */}
                        {isEditMode && (
                            <div>
                                <label className={labelStyle}>Süreç ID</label>
                                <input 
                                    type="text" 
                                    value={formData.id} 
                                    className={`${inputStyle} bg-slate-100 dark:bg-slate-600`} 
                                    disabled 
                                />
                            </div>
                        )}

                        {/* Firma */}
                        <div>
                            <label className={labelStyle}>Firma *</label>
                            <select 
                                name="firma" 
                                value={formData.firma} 
                                onChange={handleChange} 
                                className={inputStyle} 
                                required
                            >
                                <option value="">Firma Seçin</option>
                                {Object.keys(firmalar).map(firma => (
                                    <option key={firma} value={firma}>{firma}</option>
                                ))}
                            </select>
                        </div>

                        {/* Konum */}
                        <div>
                            <label className={labelStyle}>Konum *</label>
                            <select 
                                name="konum" 
                                value={formData.konum} 
                                onChange={handleChange} 
                                className={inputStyle} 
                                required
                                disabled={!formData.firma}
                            >
                                <option value="">Konum Seçin</option>
                                {availableLocations.map(konum => (
                                    <option key={konum} value={konum}>{konum}</option>
                                ))}
                            </select>
                        </div>

                        {/* Başlık */}
                        <div className="lg:col-span-2">
                            <label className={labelStyle}>Başlık *</label>
                            <input 
                                type="text" 
                                name="baslik" 
                                value={formData.baslik} 
                                onChange={handleChange} 
                                className={inputStyle} 
                                placeholder="Süreç başlığını girin"
                                required 
                            />
                        </div>

                        {/* Öncelik */}
                        <div>
                            <label className={labelStyle}>Öncelik Düzeyi</label>
                            <select 
                                name="oncelikDuzeyi" 
                                value={formData.oncelikDuzeyi} 
                                onChange={handleChange} 
                                className={inputStyle}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Orta">Orta</option>
                                <option value="Yüksek">Yüksek</option>
                            </select>
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className={labelStyle}>Kategori *</label>
                            <select 
                                name="kategori" 
                                value={formData.kategori} 
                                onChange={handleChange} 
                                className={inputStyle} 
                                required
                            >
                                <option value="">Kategori Seçin</option>
                                {Object.keys(kategoriler).map(kategori => (
                                    <option key={kategori} value={kategori}>{kategori}</option>
                                ))}
                            </select>
                        </div>

                        {/* Alt Kategori */}
                        <div>
                            <label className={labelStyle}>Alt Kategori</label>
                            <select 
                                name="altKategori" 
                                value={formData.altKategori} 
                                onChange={handleChange} 
                                className={inputStyle}
                                disabled={!formData.kategori}
                            >
                                <option value="">Alt Kategori Seçin</option>
                                {availableSubCategories.map(altKategori => (
                                    <option key={altKategori} value={altKategori}>{altKategori}</option>
                                ))}
                            </select>
                        </div>

                        {/* Durum */}
                        <div>
                            <label className={labelStyle}>Durum</label>
                            <select 
                                name="durum" 
                                value={formData.durum} 
                                onChange={handleChange} 
                                className={inputStyle}
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="İşlemde">İşlemde</option>
                                <option value="Tamamlandı">Tamamlandı</option>
                            </select>
                        </div>

                        {/* Başlangıç Tarihi */}
                        <div>
                            <label className={labelStyle}>Başlangıç Tarihi *</label>
                            <input 
                                type="date" 
                                name="baslangicTarihi" 
                                value={formData.baslangicTarihi} 
                                onChange={handleChange} 
                                className={inputStyle} 
                                required 
                            />
                        </div>

                        {/* Sonraki Kontrol Tarihi */}
                        <div>
                            <label className={labelStyle}>Sonraki Kontrol Tarihi</label>
                            <input 
                                type="date" 
                                name="sonrakiKontrolTarihi" 
                                value={formData.sonrakiKontrolTarihi} 
                                onChange={handleChange} 
                                className={inputStyle}
                                disabled={formData.durum === 'Tamamlandı'}
                            />
                        </div>

                        {/* Tamamlanma Tarihi */}
                        <div>
                            <label className={labelStyle}>Tamamlanma Tarihi</label>
                            <input 
                                type="date" 
                                name="tamamlanmaTarihi" 
                                value={formData.tamamlanmaTarihi} 
                                onChange={handleChange} 
                                className={inputStyle}
                                disabled={formData.durum !== 'Tamamlandı'}
                            />
                        </div>

                        {/* Sorumlular */}
                        <div className="lg:col-span-2">
                            <label className={labelStyle}>Sorumlular</label>
                            <select 
                                multiple 
                                onChange={handleSorumlularChange} 
                                className={`${inputStyle} h-32`}
                                value={formData.sorumlular}
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.fullName}>
                                        {user.fullName} ({user.role})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Ctrl/Cmd tuşuna basarak birden fazla seçim yapabilirsiniz</p>
                        </div>

                        {/* Süreç Detayı */}
                        <div className="lg:col-span-3">
                            <label className={labelStyle}>Süreç Detayı *</label>
                            <textarea 
                                name="surec" 
                                value={formData.surec} 
                                onChange={handleChange} 
                                className={`${inputStyle} h-24`} 
                                placeholder="Süreç hakkında detaylı bilgi girin..."
                                required 
                            />
                        </div>

                        {/* Mevcut Durum */}
                        <div className="lg:col-span-3">
                            <label className={labelStyle}>Mevcut Durum</label>
                            <textarea 
                                name="mevcutDurum" 
                                value={formData.mevcutDurum} 
                                onChange={handleChange} 
                                className={`${inputStyle} h-24`} 
                                placeholder="Sürecin mevcut durumu hakkında bilgi girin..."
                            />
                        </div>
                    </div>

                    {/* Değişiklik Geçmişi */}
                    {isEditMode && processLogs.length > 0 && (
                        <div className="mt-8 border-t dark:border-slate-700 pt-6">
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                Değişiklik Geçmişi ({processLogs.length})
                            </h3>
                            <div className="max-h-48 overflow-y-auto space-y-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                {processLogs.map(log => (
                                    <div key={log.id} className="border-b border-slate-200 dark:border-slate-700 pb-2 last:border-b-0">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">
                                            {log.userName || 'Bilinmeyen'} - '{log.field}' alanını güncelledi
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {new Date(log.timestamp).toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t dark:border-slate-700">
                        <div>
                            {isEditMode && canDelete && (
                                <button 
                                    type="button" 
                                    onClick={() => onDelete(formData)} 
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                                >
                                    Süreci Sil
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            {canEdit && (
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                                >
                                    {isEditMode ? 'Güncelle' : 'Kaydet'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProcessModal;