import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import * as api from '../../services/api';

const SystemSettings = () => {
    const { success, error } = useToast();
    const [settings, setSettings] = useState({
        siteName: 'Süreç Yönetimi',
        siteDescription: 'Profesyonel süreç takip ve yönetim sistemi',
        logoUrl: '',
        logo: null,
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        allowRegistration: true,
        requireEmailVerification: true,
        defaultUserRole: 'Viewer',
        sessionTimeout: 24,
        maxFileSize: 50,
        allowedFileTypes: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip',
        emailNotifications: true,
        systemLanguage: 'tr',
        dateFormat: 'DD/MM/YYYY',
        currency: 'TRY'
    });
    
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // API'den ayarları yükle
            // const response = await api.getSystemSettings();
            // setSettings(response.data);
            
            // Geçici olarak localStorage'dan yükle
            const storedSettings = localStorage.getItem('systemSettings');
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            }
        } catch (err) {
            console.error('Ayarlar yüklenemedi:', err);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            error('Logo dosyası 2MB\'dan büyük olamaz');
            return;
        }

        if (!file.type.startsWith('image/')) {
            error('Sadece resim dosyaları yüklenebilir');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const logoUrl = e.target.result;
            setSettings(prev => ({ ...prev, logoUrl, logo: file }));
            
            // localStorage'a kaydet
            const systemSettings = {
                siteName: settings.siteName,
                logoUrl: logoUrl
            };
            localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
            
            success('Logo başarıyla yüklendi');
            
            // Sayfayı yeniden yükle ki header güncellensin
            setTimeout(() => window.location.reload(), 1000);
        };
        reader.readAsDataURL(file);
    };

    const handleSiteNameChange = (newSiteName) => {
        setSettings(prev => ({ ...prev, siteName: newSiteName }));
        
        // localStorage'a kaydet
        const systemSettings = {
            siteName: newSiteName,
            logoUrl: settings.logoUrl
        };
        localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
        
        success('Site adı güncellendi');
        
        // Sayfayı yeniden yükle ki header güncellensin
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                if (key === 'logo' && settings[key] instanceof File) {
                    formData.append('logo', settings[key]);
                } else if (key !== 'logo') {
                    formData.append(key, settings[key]);
                }
            });

            // await api.updateSystemSettings(formData);
            success('Sistem ayarları başarıyla güncellendi');
        } catch (err) {
            error('Ayarlar güncellenirken hata oluştu: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );

    const inputStyle = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";
    const sectionStyle = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    ⚙️ Sistem Ayarları
                </h2>
                <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                    {loading ? '⏳ Kaydediliyor...' : '💾 Ayarları Kaydet'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <TabButton id="general" label="Genel" icon="🏢" />
                <TabButton id="appearance" label="Görünüm" icon="🎨" />
                <TabButton id="security" label="Güvenlik" icon="🔒" />
                <TabButton id="files" label="Dosya Ayarları" icon="📁" />
                <TabButton id="notifications" label="Bildirimler" icon="🔔" />
                <TabButton id="advanced" label="Gelişmiş" icon="⚡" />
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Site Kimlik Bilgileri */}
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            🏢 Site Kimlik Bilgileri
                        </h3>
                        <div className="space-y-6">
                            {/* Logo Yönetimi */}
                            <div>
                                <label className={labelStyle}>Site Logosu</label>
                                <div className="space-y-4">
                                    {/* Mevcut Logo Önizleme */}
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                                        {settings.logoUrl ? (
                                            <div className="space-y-3">
                                                <img 
                                                    src={settings.logoUrl} 
                                                    alt="Site Logosu" 
                                                    className="max-h-24 mx-auto rounded-lg shadow-sm"
                                                />
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Mevcut logo
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-lg mx-auto flex items-center justify-center">
                                                    🖼️
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    Henüz logo yüklenmemiş
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Logo Yükleme */}
                                    <div>
                                        <input
                                            type="file"
                                            id="logoUpload"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <div className="flex gap-3">
                                            <label
                                                htmlFor="logoUpload"
                                                className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-center transition-colors"
                                            >
                                                📁 Logo Seç
                                            </label>
                                            {settings.logoUrl && (
                                                <button
                                                    onClick={() => {
                                                        setSettings(prev => ({ ...prev, logoUrl: '' }));
                                                        const systemSettings = {
                                                            siteName: settings.siteName,
                                                            logoUrl: ''
                                                        };
                                                        localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
                                                        success('Logo kaldırıldı');
                                                        setTimeout(() => window.location.reload(), 1000);
                                                    }}
                                                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    🗑️ Kaldır
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            Maksimum 2MB, PNG/JPG formatında önerilir
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Site Adı */}
                            <div>
                                <label className={labelStyle}>Site Adı</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => handleSiteNameChange(e.target.value)}
                                    className={inputStyle}
                                    placeholder="Süreç Yönetimi"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Bu ad header'da ve sayfa başlığında görünecek
                                </p>
                            </div>

                            {/* Site Açıklaması */}
                            <div>
                                <label className={labelStyle}>Site Açıklaması</label>
                                <textarea
                                    value={settings.siteDescription}
                                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                                    className={`${inputStyle} h-24`}
                                    placeholder="Profesyonel süreç takip ve yönetim sistemi"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo Önizleme */}
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            👁️ Canlı Önizleme
                        </h3>
                        <div className="space-y-4">
                            {/* Header Simülasyonu */}
                            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    {settings.logoUrl && (
                                        <img 
                                            src={settings.logoUrl} 
                                            alt="Logo" 
                                            className="h-8 w-8 object-contain rounded"
                                        />
                                    )}
                                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                        {settings.siteName || 'Site Adı'}
                                    </h1>
                                </div>
                            </div>
                            
                            {/* Bilgi Kartı */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    💡 Logo Önerileri:
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                    <li>• Kare veya yuvarlak formatı tercih edin</li>
                                    <li>• Şeffaf arka plan (PNG) kullanın</li>
                                    <li>• Minimum 64x64 piksel boyutunda olsun</li>
                                    <li>• Koyu ve açık temada uyumlu renkler seçin</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            🎨 Renk Ayarları
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelStyle}>Ana Renk</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                        className="w-12 h-12 rounded border border-slate-300 dark:border-slate-600"
                                    />
                                    <input
                                        type="text"
                                        value={settings.primaryColor}
                                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                        className={`${inputStyle} flex-1`}
                                        placeholder="#2563eb"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>İkincil Renk</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings.secondaryColor}
                                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                                        className="w-12 h-12 rounded border border-slate-300 dark:border-slate-600"
                                    />
                                    <input
                                        type="text"
                                        value={settings.secondaryColor}
                                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                                        className={`${inputStyle} flex-1`}
                                        placeholder="#64748b"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            🌐 Bölgesel Ayarlar
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelStyle}>Sistem Dili</label>
                                <select
                                    value={settings.systemLanguage}
                                    onChange={(e) => handleSettingChange('systemLanguage', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="tr">Türkçe</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Tarih Formatı</label>
                                <select
                                    value={settings.dateFormat}
                                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Para Birimi</label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="TRY">Türk Lirası (₺)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            🔒 Kullanıcı Ayarları
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settings.allowRegistration}
                                        onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Yeni kullanıcı kaydına izin ver
                                    </span>
                                </label>
                            </div>
                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settings.requireEmailVerification}
                                        onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        E-posta doğrulaması zorunlu
                                    </span>
                                </label>
                            </div>
                            <div>
                                <label className={labelStyle}>Varsayılan Kullanıcı Rolü</label>
                                <select
                                    value={settings.defaultUserRole}
                                    onChange={(e) => handleSettingChange('defaultUserRole', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="Viewer">Görüntüleyici</option>
                                    <option value="Editor">Düzenleyici</option>
                                    <option value="Admin">Yönetici</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Oturum Zaman Aşımı (Saat)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="168"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            🛡️ Güvenlik Politikaları
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                                    ⚠️ Güvenlik Önerileri
                                </h4>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                                    <li>• Güçlü şifre politikası uygulayın</li>
                                    <li>• Düzenli yedekleme yapın</li>
                                    <li>• Sistem güncellemelerini takip edin</li>
                                    <li>• Kullanıcı erişimlerini düzenli kontrol edin</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            📁 Dosya Yükleme Ayarları
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelStyle}>Maksimum Dosya Boyutu (MB)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={settings.maxFileSize}
                                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>İzin Verilen Dosya Türleri</label>
                                <textarea
                                    value={settings.allowedFileTypes}
                                    onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                                    className={`${inputStyle} h-20`}
                                    placeholder=".jpg,.png,.pdf,.doc"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Dosya uzantılarını virgülle ayırın
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            💾 Depolama Bilgileri
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Toplam Depolama
                                    </span>
                                    <span className="text-sm text-blue-600 dark:text-blue-400">
                                        2.3 GB / 10 GB
                                    </span>
                                </div>
                                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded">
                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                        Toplam Dosya
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        1,245
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded">
                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                        Bu Ay Yüklenen
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        87
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            🔔 E-posta Bildirimleri
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailNotifications}
                                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        E-posta bildirimlerini etkinleştir
                                    </span>
                                </label>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                                    📧 Bildirim Türleri
                                </h4>
                                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                                    <li>• Yeni süreç atandığında</li>
                                    <li>• Süreç durumu değiştiğinde</li>
                                    <li>• Kontrol tarihi yaklaştığında</li>
                                    <li>• Süreç tamamlandığında</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            📊 Bildirim İstatistikleri
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded">
                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                        Bu Ay Gönderilen
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        342
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded">
                                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                                        Başarı Oranı
                                    </div>
                                    <div className="text-lg font-bold text-green-600">
                                        98.5%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className={sectionStyle}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            ⚡ Gelişmiş Ayarlar
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700 dark:text-slate-300">🗄️ Veritabanı</h4>
                                <div className="space-y-2">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors">
                                        💾 Veritabanı Yedeği Al
                                    </button>
                                    <button className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg font-medium transition-colors">
                                        🧹 Geçici Dosyaları Temizle
                                    </button>
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-medium transition-colors">
                                        📊 Sistem Raporunu Oluştur
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700 dark:text-slate-300">⚠️ Tehlikeli İşlemler</h4>
                                <div className="space-y-2">
                                    <button className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors">
                                        🗑️ Tüm Log Kayıtlarını Temizle
                                    </button>
                                    <button className="w-full bg-red-700 hover:bg-red-800 text-white p-3 rounded-lg font-medium transition-colors">
                                        ⚠️ Sistemi Fabrika Ayarlarına Sıfırla
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;