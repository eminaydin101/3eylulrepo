import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

export const Profile = ({ onDownloadData, onDeleteAccount }) => {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            error('Yeni şifreler eşleşmiyor');
            return;
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            error('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                fullName: formData.fullName,
                email: formData.email
            };

            if (formData.newPassword) {
                updateData.password = formData.newPassword;
            }

            await api.updateUser(user.id, updateData);
            success('Profil başarıyla güncellendi');
            setIsEditing(false);
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            error('Profil güncelleme hatası: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const userInitials = (user?.fullName || user?.email || '??').split(' ').map(n => n[0]).join('').toUpperCase();
    
    const sectionStyle = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6";
    const inputStyle = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    👤 Profilim
                </h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isEditing 
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isEditing ? '❌ İptal Et' : '✏️ Düzenle'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className={`${sectionStyle} text-center`}>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                        {userInitials}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        {user?.fullName}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {user?.email}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        user?.role === 'SuperAdmin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        user?.role === 'Admin' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        user?.role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                        {user?.role}
                    </span>
                </div>

                {/* Profile Form */}
                <div className={`${sectionStyle} lg:col-span-2`}>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">
                        Profil Bilgileri
                    </h3>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Ad Soyad</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`${inputStyle} ${!isEditing ? 'bg-slate-100 dark:bg-slate-600' : ''}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>E-posta</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`${inputStyle} ${!isEditing ? 'bg-slate-100 dark:bg-slate-600' : ''}`}
                                    required
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <label className={labelStyle}>Yeni Şifre (Opsiyonel)</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={inputStyle}
                                        placeholder="Değiştirmek istiyorsanız girin"
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Yeni Şifre Tekrar</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={inputStyle}
                                        placeholder="Yeni şifrenizi tekrar girin"
                                    />
                                </div>
                            </div>
                        )}

                        {isEditing && (
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            fullName: user?.fullName || '',
                                            email: user?.email || '',
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                                >
                                    {loading ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Account Stats */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    📊 Hesap İstatistikleri
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">42</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Süreç Sayısı</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">18</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Tamamlanan</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">156</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Mesaj Sayısı</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">30</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Gün Aktif</div>
                    </div>
                </div>
            </div>

            {/* Veri ve Gizlilik - AKTİF BUTONLAR */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🛡️ Veri ve Gizlilik
                </h3>
                <div className="space-y-3">
                    <button 
                        onClick={onDownloadData}
                        className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <div className="font-medium text-slate-700 dark:text-slate-300">📥 Verilerimi İndir</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hesap verilerinizin bir kopyasını alın</div>
                    </button>
                    
                    <button 
                        onClick={onDeleteAccount}
                        className="w-full text-left p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                    >
                        <div className="font-medium text-red-700 dark:text-red-300">🗑️ Hesabımı Sil</div>
                        <div className="text-sm text-red-600 dark:text-red-400">Hesabınızı kalıcı olarak silin</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Settings = () => {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [settings, setSettings] = useState({
        theme: localStorage.getItem('theme') || 'light',
        notifications: true,
        emailNotifications: true,
        language: 'tr',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Europe/Istanbul'
    });
    
    const [loading, setLoading] = useState(false);

    const handleSettingChange = async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        
        if (key === 'theme') {
            document.documentElement.classList.toggle('dark', value === 'dark');
            localStorage.setItem('theme', value);
        }
        
        success(`${getSettingLabel(key)} ayarı güncellendi`);
    };

    const getSettingLabel = (key) => {
        const labels = {
            theme: 'Tema',
            notifications: 'Push Bildirimleri',
            emailNotifications: 'E-posta Bildirimleri',
            language: 'Dil',
            dateFormat: 'Tarih Formatı',
            timezone: 'Zaman Dilimi'
        };
        return labels[key] || key;
    };

    const handleSaveAllSettings = async () => {
        setLoading(true);
        try {
            // Simulate API call to save settings
            await new Promise(resolve => setTimeout(resolve, 1500));
            success('Tüm ayarlar başarıyla kaydedildi');
        } catch (err) {
            error('Ayarlar kaydedilirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleResetToDefault = () => {
        if (window.confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
            const defaultSettings = {
                theme: 'light',
                notifications: true,
                emailNotifications: true,
                language: 'tr',
                dateFormat: 'DD/MM/YYYY',
                timezone: 'Europe/Istanbul'
            };
            setSettings(defaultSettings);
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            success('Ayarlar varsayılan değerlere sıfırlandı');
        }
    };

    const handleExportSettings = () => {
        const settingsData = {
            ...settings,
            exportDate: new Date().toISOString(),
            user: user?.fullName || 'Unknown User'
        };
        
        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ayarlarim-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        success('Ayarlar dışa aktarıldı');
    };

    const handleImportSettings = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                const validKeys = ['theme', 'notifications', 'emailNotifications', 'language', 'dateFormat', 'timezone'];
                const filteredSettings = {};
                
                validKeys.forEach(key => {
                    if (importedSettings.hasOwnProperty(key)) {
                        filteredSettings[key] = importedSettings[key];
                    }
                });
                
                setSettings(prev => ({ ...prev, ...filteredSettings }));
                
                if (filteredSettings.theme) {
                    document.documentElement.classList.toggle('dark', filteredSettings.theme === 'dark');
                    localStorage.setItem('theme', filteredSettings.theme);
                }
                
                success('Ayarlar başarıyla içe aktarıldı');
            } catch (err) {
                error('Geçersiz ayar dosyası');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const sectionStyle = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6";

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    ⚙️ Ayarlar
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={handleResetToDefault}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
                    >
                        🔄 Varsayılan
                    </button>
                    <button
                        onClick={handleSaveAllSettings}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                    >
                        {loading ? '⏳ Kaydediliyor...' : '💾 Tümünü Kaydet'}
                    </button>
                </div>
            </div>

            {/* Görünüm Ayarları */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🎨 Görünüm Ayarları
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">Tema</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Koyu veya açık temayı seçin</p>
                        </div>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"
                        >
                            <option value="light">🌞 Açık Tema</option>
                            <option value="dark">🌙 Koyu Tema</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">Dil</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Arayüz dili</p>
                        </div>
                        <select
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"
                        >
                            <option value="tr">🇹🇷 Türkçe</option>
                            <option value="en">🇺🇸 English</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bildirim Ayarları */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🔔 Bildirim Ayarları
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">Push Bildirimleri</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tarayıcı bildirimleri</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">E-posta Bildirimleri</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Önemli güncellemeler için email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Bölgesel Ayarlar */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🌍 Bölgesel Ayarlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">Tarih Formatı</label>
                        <select
                            value={settings.dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">Zaman Dilimi</label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"
                        >
                            <option value="Europe/Istanbul">🇹🇷 İstanbul</option>
                            <option value="Europe/London">🇬🇧 Londra</option>
                            <option value="America/New_York">🇺🇸 New York</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Ayar Yönetimi */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    📂 Ayar Yönetimi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleExportSettings}
                        className="flex items-center justify-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-700 dark:text-green-300"
                    >
                        <span className="text-xl">📤</span>
                        <div className="text-left">
                            <div className="font-medium">Ayarları Dışa Aktar</div>
                            <div className="text-sm opacity-75">JSON dosyası olarak indir</div>
                        </div>
                    </button>
                    
                    <label className="flex items-center justify-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-300 cursor-pointer">
                        <span className="text-xl">📥</span>
                        <div className="text-left">
                            <div className="font-medium">Ayarları İçe Aktar</div>
                            <div className="text-sm opacity-75">JSON dosyasından yükle</div>
                        </div>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportSettings}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Veri ve Gizlilik */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🛡️ Veri ve Gizlilik
                </h3>
                <div className="space-y-3">
                    <button 
                        className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        onClick={() => success('Veri indirme özelliği yakında gelecek')}
                    >
                        <div className="font-medium text-slate-700 dark:text-slate-300">📥 Verilerimi İndir</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hesap verilerinizin bir kopyasını alın</div>
                    </button>
                    
                    <button 
                        className="w-full text-left p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                        onClick={() => {
                            if (window.confirm('⚠️ Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                error('Hesap silme özelliği güvenlik nedeniyle admin onayı gerektirmektedir.');
                            }
                        }}
                    >
                        <div className="font-medium text-red-700 dark:text-red-300">🗑️ Hesabımı Sil</div>
                        <div className="text-sm text-red-600 dark:text-red-400">Hesabınızı kalıcı olarak silin</div>
                    </button>
                </div>
            </div>

            {/* Sistem Bilgileri */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    ℹ️ Sistem Bilgileri
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">Versiyon</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">v1.2.0</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">Son Güncelleme</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date().toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">Tarayıcı</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                             navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                             navigator.userAgent.includes('Safari') ? 'Safari' : 'Bilinmeyen'}
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">Platform</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {navigator.platform || 'Web'}
                        </div>
                    </div>
                </div>
                
                {/* Sistem Durumu */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                            <h4 className="font-semibold text-green-700 dark:text-green-300">Sistem Durumu: Çevrimiçi</h4>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Tüm sistemler normal çalışıyor • Son kontrol: {new Date().toLocaleTimeString('tr-TR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gelişmiş Ayarlar */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    ⚡ Gelişmiş Ayarlar
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">Performans Modu</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Animasyonları azaltarak performansı artır</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                defaultChecked={false}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        document.body.classList.add('reduce-motion');
                                        success('Performans modu etkinleştirildi');
                                    } else {
                                        document.body.classList.remove('reduce-motion');
                                        success('Performans modu devre dışı bırakıldı');
                                    }
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">Debug Modu</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Geliştirici konsol bilgilerini göster</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                defaultChecked={false}
                                onChange={(e) => {
                                    localStorage.setItem('debugMode', e.target.checked);
                                    success(e.target.checked ? 'Debug modu etkinleştirildi' : 'Debug modu kapatıldı');
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700 dark:text-slate-300">Otomatik Kaydetme</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Form verilerini otomatik olarak kaydet</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                defaultChecked={true}
                                onChange={(e) => {
                                    localStorage.setItem('autoSave', e.target.checked);
                                    success(e.target.checked ? 'Otomatik kaydetme açıldı' : 'Otomatik kaydetme kapatıldı');
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Cache Yönetimi */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Cache Yönetimi</h4>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                localStorage.clear();
                                sessionStorage.clear();
                                success('Tarayıcı önbelleği temizlendi');
                            }}
                            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-300 rounded-lg font-medium transition-colors"
                        >
                            🗑️ Önbelleği Temizle
                        </button>
                        
                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 rounded-lg font-medium transition-colors"
                        >
                            🔄 Sayfayı Yenile
                        </button>
                        
                        <button
                            onClick={() => {
                                if ('serviceWorker' in navigator) {
                                    navigator.serviceWorker.getRegistrations().then(registrations => {
                                        registrations.forEach(registration => registration.unregister());
                                        success('Service worker temizlendi');
                                    });
                                }
                            }}
                            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-300 rounded-lg font-medium transition-colors"
                        >
                            ⚡ Service Worker Temizle
                        </button>
                    </div>
                </div>
            </div>

            {/* Yardım ve Destek */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🆘 Yardım ve Destek
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => success('Yardım dökümanları yakında eklenecek')}
                        className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-300"
                    >
                        <span className="text-xl">📚</span>
                        <div className="text-left">
                            <div className="font-medium">Kullanım Kılavuzu</div>
                            <div className="text-sm opacity-75">Detaylı kullanım talimatları</div>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => success('Destek sistemi yakında aktif olacak')}
                        className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-700 dark:text-green-300"
                    >
                        <span className="text-xl">💬</span>
                        <div className="text-left">
                            <div className="font-medium">Destek Talebi</div>
                            <div className="text-sm opacity-75">Teknik destek alın</div>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => success('Geri bildirim formu hazırlanıyor')}
                        className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-yellow-700 dark:text-yellow-300"
                    >
                        <span className="text-xl">💡</span>
                        <div className="text-left">
                            <div className="font-medium">Geri Bildirim</div>
                            <div className="text-sm opacity-75">Önerilerinizi paylaşın</div>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => success('Sık sorulan sorular hazırlanıyor')}
                        className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-purple-700 dark:text-purple-300"
                    >
                        <span className="text-xl">❓</span>
                        <div className="text-left">
                            <div className="font-medium">Sık Sorulan Sorular</div>
                            <div className="text-sm opacity-75">Yaygın sorunların çözümleri</div>
                        </div>
                    </button>
                </div>

                {/* İletişim Bilgileri */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">📞 İletişim Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Email:</span>
                            <span className="ml-2 text-slate-700 dark:text-slate-300">support@example.com</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Telefon:</span>
                            <span className="ml-2 text-slate-700 dark:text-slate-300">+90 XXX XXX XX XX</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Çalışma Saatleri:</span>
                            <span className="ml-2 text-slate-700 dark:text-slate-300">09:00 - 18:00 (Hafta içi)</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Web:</span>
                            <span className="ml-2 text-slate-700 dark:text-slate-300">www.example.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};