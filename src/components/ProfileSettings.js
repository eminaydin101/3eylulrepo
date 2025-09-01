import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';

export const Profile = () => {
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
        </div>
    );
};

export const Settings = () => {
    const { user } = useAuth();
    const { success } = useToast();
    const [settings, setSettings] = useState({
        theme: localStorage.getItem('theme') || 'light',
        notifications: true,
        emailNotifications: true,
        language: 'tr',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Europe/Istanbul'
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        
        if (key === 'theme') {
            document.documentElement.classList.toggle('dark', value === 'dark');
            localStorage.setItem('theme', value);
        }
        
        success(`${key} ayarı güncellendi`);
    };

    const sectionStyle = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6";

    return (
        <div className="space-y-6 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                ⚙️ Ayarlar
            </h2>

            {/* Appearance Settings */}
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

            {/* Notification Settings */}
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

            {/* Regional Settings */}
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

            {/* Data & Privacy */}
            <div className={sectionStyle}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🛡️ Veri ve Gizlilik
                </h3>
                <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <div className="font-medium text-slate-700 dark:text-slate-300">📥 Verilerimi İndir</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hesap verilerinizin bir kopyasını alın</div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <div className="font-medium text-slate-700 dark:text-slate-300">🗑️ Hesabımı Sil</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hesabınızı kalıcı olarak silin</div>
                    </button>
                </div>
            </div>
        </div>
    );
};