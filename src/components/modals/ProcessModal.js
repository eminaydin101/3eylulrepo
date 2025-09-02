import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FileUpload from '../FileUpload';
import * as api from '../../services/api';

const ProcessModal = ({ isOpen, onClose, onSubmit, isEditMode, initialData, onDelete, focusField = null }) => {
    const { users, firmalar, kategoriler, logs } = useData();
    const { user } = useAuth();
    const { success, error } = useToast();
    const [processFiles, setProcessFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [activeTab, setActiveTab] = useState('form'); // 'form', 'files', 'history'
    
    // Field refs for focusing
    const fieldRefs = {
        id: useRef(),
        firma: useRef(),
        konum: useRef(),
        baslik: useRef(),
        surec: useRef(),
        mevcutDurum: useRef(),
        baslangicTarihi: useRef(),
        sonrakiKontrolTarihi: useRef(),
        tamamlanmaTarihi: useRef(),
        kategori: useRef(),
        altKategori: useRef(),
        sorumlular: useRef(),
        oncelikDuzeyi: useRef(),
        durum: useRef()
    };

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
    const [previousCategory, setPreviousCategory] = useState(''); // Kategori değişikliği için

    // Dosyaları yükle
    const loadProcessFiles = async (processId) => {
        if (!processId) return;
        
        setLoadingFiles(true);
        try {
            const response = await api.getProcessFiles(processId);
            setProcessFiles(response.data);
        } catch (err) {
            console.error('Dosyalar yüklenirken hata:', err);
            error('Dosyalar yüklenemedi');
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData(initialData);
                setPreviousCategory(initialData.kategori);
                loadProcessFiles(initialData.id);
                setActiveTab('form');
            } else {
                const emptyForm = getEmptyForm();
                setFormData(emptyForm);
                setPreviousCategory('');
                setProcessFiles([]);
                setActiveTab('form');
            }
        }
    }, [isEditMode, initialData, isOpen]);

    // Focus specific field when modal opens
    useEffect(() => {
        if (isOpen && focusField && fieldRefs[focusField]?.current) {
            setTimeout(() => {
                fieldRefs[focusField].current.focus();
                fieldRefs[focusField].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [isOpen, focusField]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Kategori değiştiğinde alt kategoriyi sıfırla
        if (name === 'kategori' && value !== previousCategory) {
            setFormData(prev => ({ ...prev, [name]: value, altKategori: '' }));
            setPreviousCategory(value);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSorumlularChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, sorumlular: selectedOptions });
    };

    const handleSubmit = (e) => { 
        e.preventDefault();
        
        // Form validation
        if (!formData.firma || !formData.konum || !formData.baslik || !formData.surec || !formData.kategori) {
            error('Zorunlu alanları doldurun: Firma, Konum, Başlık, Süreç Detayı, Kategori');
            return;
        }

        // Durum tamamlandı ise tamamlanma tarihi zorunlu
        if (formData.durum === 'Tamamlandı' && !formData.tamamlanmaTarihi) {
            setFormData(prev => ({ ...prev, tamamlanmaTarihi: new Date().toISOString().slice(0, 10) }));
        }

        // Durum tamamlandı değilse tamamlanma tarihini sıfırla
        if (formData.durum !== 'Tamamlandı' && formData.tamamlanmaTarihi) {
            setFormData(prev => ({ ...prev, tamamlanmaTarihi: '' }));
        }

        onSubmit(formData); 
    };

    const handleFilesChange = () => {
        loadProcessFiles(formData.id);
    };

    const processLogs = isEditMode ? (logs || []).filter(log => log.processId === formData.id) : [];
    const canEdit = user.role === 'Admin' || user.role === 'Editor' || user.role === 'SuperAdmin';
    const canDelete = user.role === 'Admin' || user.role === 'SuperAdmin';

    const inputStyle = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    // Firma değiştiğinde konumları güncelle
    const availableLocations = firmalar[formData.firma] || [];
    const availableSubCategories = kategoriler[formData.kategori] || [];

    // Tab component
    const TabButton = ({ id, label, icon, count = null }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
            {count !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === id ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );

    // Process Activity Timeline Component
    const ProcessTimeline = ({ logs }) => {
        const groupedLogs = logs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toLocaleDateString('tr-TR');
            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {});

        const getChangeIcon = (field) => {
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

        return (
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedLogs)
                    .sort(([a], [b]) => new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-')))
                    .map(([date, dayLogs]) => (
                    <div key={date} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full inline-block mb-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{date}</span>
                        </div>
                        
                        {dayLogs.map((log, index) => (
                            <div key={log.id} className="relative mb-4 last:mb-0">
                                <div className="absolute -left-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{getChangeIcon(log.field)}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {log.userName || 'Sistem'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(log.timestamp).toLocaleTimeString('tr-TR', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                <strong>{log.field}</strong> alanını güncelledi
                                            </p>
                                            
                                            {log.oldValue && log.newValue && log.field !== 'Oluşturma' && (
                                                <div className="mt-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-600 dark:text-red-400">Eski:</span>
                                                        <span className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-red-700 dark:text-red-300">
                                                            {log.oldValue.length > 50 ? log.oldValue.substring(0, 50) + '...' : log.oldValue}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-green-600 dark:text-green-400">Yeni:</span>
                                                        <span className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-green-700 dark:text-green-300">
                                                            {log.newValue.length > 50 ? log.newValue.substring(0, 50) + '...' : log.newValue}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                
                {logs.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <div className="text-4xl mb-2">📝</div>
                        <p>Henüz değişiklik kaydı bulunmuyor</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {isEditMode ? `Süreç Düzenle - #${formData.id}` : 'Yeni Süreç Ekle'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <TabButton id="form" label="Süreç Bilgileri" icon="📋" />
                    {isEditMode && (
                        <>
                            <TabButton 
                                id="files" 
                                label="Dosyalar" 
                                icon="📎" 
                                count={processFiles.length} 
                            />
                            <TabButton 
                                id="history" 
                                label="Değişiklik Geçmişi" 
                                icon="📜" 
                                count={processLogs.length} 
                            />
                        </>
                    )}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Form Tab */}
                    {activeTab === 'form' && (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                
                                {/* ID - sadece edit modunda göster */}
                                {isEditMode && (
                                    <div>
                                        <label className={labelStyle}>Süreç ID</label>
                                        <input 
                                            ref={fieldRefs.id}
                                            type="text" 
                                            value={formData.id} 
                                            className={`${inputStyle} bg-slate-100 dark:bg-slate-600 ${focusField === 'id' ? 'ring-2 ring-blue-500' : ''}`} 
                                            disabled 
                                        />
                                    </div>
                                )}

                                {/* Firma */}
                                <div>
                                    <label className={labelStyle}>Firma *</label>
                                    <select 
                                        ref={fieldRefs.firma}
                                        name="firma" 
                                        value={formData.firma} 
                                        onChange={(e) => {
                                            handleChange(e);
                                            // Firma değiştiğinde konumu da sıfırla
                                            setFormData(prev => ({ ...prev, konum: '' }));
                                        }}
                                        className={`${inputStyle} ${focusField === 'firma' ? 'ring-2 ring-blue-500' : ''}`} 
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
                                        ref={fieldRefs.konum}
                                        name="konum" 
                                        value={formData.konum} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'konum' ? 'ring-2 ring-blue-500' : ''}`} 
                                        required
                                        disabled={!formData.firma}
                                    >
                                        <option value="">Konum Seçin</option>
                                        {availableLocations.map(konum => (
                                            <option key={konum} value={konum}>{konum}</option>
                                        ))}
                                    </select>
                                    {!formData.firma && (
                                        <p className="text-xs text-slate-500 mt-1">Önce firma seçin</p>
                                    )}
                                </div>

                                {/* Başlık */}
                                <div className="lg:col-span-2">
                                    <label className={labelStyle}>Başlık *</label>
                                    <input 
                                        ref={fieldRefs.baslik}
                                        type="text" 
                                        name="baslik" 
                                        value={formData.baslik} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'baslik' ? 'ring-2 ring-blue-500' : ''}`} 
                                        placeholder="Süreç başlığını girin"
                                        required 
                                    />
                                </div>

                                {/* Öncelik */}
                                <div>
                                    <label className={labelStyle}>Öncelik Düzeyi</label>
                                    <select 
                                        ref={fieldRefs.oncelikDuzeyi}
                                        name="oncelikDuzeyi" 
                                        value={formData.oncelikDuzeyi} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'oncelikDuzeyi' ? 'ring-2 ring-blue-500' : ''}`}
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
                                        ref={fieldRefs.kategori}
                                        name="kategori" 
                                        value={formData.kategori} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'kategori' ? 'ring-2 ring-blue-500' : ''}`} 
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
                                        ref={fieldRefs.altKategori}
                                        name="altKategori" 
                                        value={formData.altKategori} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'altKategori' ? 'ring-2 ring-blue-500' : ''}`}
                                        disabled={!formData.kategori}
                                    >
                                        <option value="">Alt Kategori Seçin</option>
                                        {availableSubCategories.map(altKategori => (
                                            <option key={altKategori} value={altKategori}>{altKategori}</option>
                                        ))}
                                    </select>
                                    {!formData.kategori && (
                                        <p className="text-xs text-slate-500 mt-1">Önce kategori seçin</p>
                                    )}
                                </div>

                                {/* Durum */}
                                <div>
                                    <label className={labelStyle}>Durum</label>
                                    <select 
                                        ref={fieldRefs.durum}
                                        name="durum" 
                                        value={formData.durum} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'durum' ? 'ring-2 ring-blue-500' : ''}`}
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
                                        ref={fieldRefs.baslangicTarihi}
                                        type="date" 
                                        name="baslangicTarihi" 
                                        value={formData.baslangicTarihi} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'baslangicTarihi' ? 'ring-2 ring-blue-500' : ''}`} 
                                        required 
                                    />
                                </div>

                                {/* Sonraki Kontrol Tarihi */}
                                <div>
                                    <label className={labelStyle}>Sonraki Kontrol Tarihi</label>
                                    <input 
                                        ref={fieldRefs.sonrakiKontrolTarihi}
                                        type="date" 
                                        name="sonrakiKontrolTarihi" 
                                        value={formData.sonrakiKontrolTarihi} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'sonrakiKontrolTarihi' ? 'ring-2 ring-blue-500' : ''}`}
                                        disabled={formData.durum === 'Tamamlandı'}
                                    />
                                </div>

                                {/* Tamamlanma Tarihi */}
                                <div>
                                    <label className={labelStyle}>Tamamlanma Tarihi</label>
                                    <input 
                                        ref={fieldRefs.tamamlanmaTarihi}
                                        type="date" 
                                        name="tamamlanmaTarihi" 
                                        value={formData.tamamlanmaTarihi} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} ${focusField === 'tamamlanmaTarihi' ? 'ring-2 ring-blue-500' : ''}`}
                                        disabled={formData.durum !== 'Tamamlandı'}
                                    />
                                </div>

                                {/* Sorumlular */}
                                <div className="lg:col-span-2">
                                    <label className={labelStyle}>Sorumlular</label>
                                    <select 
                                        ref={fieldRefs.sorumlular}
                                        multiple 
                                        onChange={handleSorumlularChange} 
                                        className={`${inputStyle} h-32 ${focusField === 'sorumlular' ? 'ring-2 ring-blue-500' : ''}`}
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
                                        ref={fieldRefs.surec}
                                        name="surec" 
                                        value={formData.surec} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} h-24 ${focusField === 'surec' ? 'ring-2 ring-blue-500' : ''}`} 
                                        placeholder="Süreç hakkında detaylı bilgi girin..."
                                        required 
                                    />
                                </div>

                                {/* Mevcut Durum */}
                                <div className="lg:col-span-3">
                                    <label className={labelStyle}>Mevcut Durum</label>
                                    <textarea 
                                        ref={fieldRefs.mevcutDurum}
                                        name="mevcutDurum" 
                                        value={formData.mevcutDurum} 
                                        onChange={handleChange} 
                                        className={`${inputStyle} h-24 ${focusField === 'mevcutDurum' ? 'ring-2 ring-blue-500' : ''}`} 
                                        placeholder="Sürecin mevcut durumu hakkında bilgi girin..."
                                    />
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Files Tab */}
                    {activeTab === 'files' && isEditMode && (
                        <div>
                            {loadingFiles ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-600 dark:text-slate-400">Dosyalar yükleniyor...</p>
                                </div>
                            ) : (
                                <FileUpload 
                                    processId={formData.id} 
                                    files={processFiles} 
                                    onFilesChange={handleFilesChange}
                                />
                            )}
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && isEditMode && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    Süreç Değişiklik Geçmişi
                                </h3>
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                                    {processLogs.length} kayıt
                                </span>
                            </div>
                            <ProcessTimeline logs={processLogs} />
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-between items-center p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <div>
                        {isEditMode && canDelete && (
                            <button 
                                type="button" 
                                onClick={() => onDelete(formData)} 
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                            >
                                🗑️ Süreci Sil
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
                        {canEdit && activeTab === 'form' && (
                            <button 
                                type="submit" 
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                            >
                                {isEditMode ? '💾 Güncelle' : '✨ Kaydet'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessModal;