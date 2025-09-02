import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import * as api from '../../services/api';

const SystemSettings = ({ onSettingsChange }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.getSystemSettings();
            setSettings(response.data);
        } catch (err) {
            error('Sistem ayarları yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateSystemSettings(settings);
            success('Sistem ayarları kaydedildi');
            if (onSettingsChange) onSettingsChange();
        } catch (err) {
            error('Ayarlar kaydedilemedi: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    ⚙️ Sistem Ayarları
                </h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    💾 Kaydet
                </button>
            </div>

            <div className="space-y-6">
                {/* Site Bilgileri */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        🌐 Site Bilgileri
                    </h4>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Site Adı *
                        </label>
                        <input
                            type="text"
                            value={settings.siteName || ''}
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            placeholder="Site adını giriniz"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Site Açıklaması
                        </label>
                        <textarea
                            value={settings.siteDescription || ''}
                            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            placeholder="Site açıklaması"
                        />
                    </div>
                </div>

                {/* Görünüm Ayarları */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        🎨 Görünüm Ayarları
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Ana Renk
                            </label>
                            <input
                                type="color"
                                value={settings.primaryColor || '#2563eb'}
                                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                className="w-full h-12 border border-slate-300 dark:border-slate-600 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                İkincil Renk
                            </label>
                            <input
                                type="color"
                                value={settings.secondaryColor || '#64748b'}
                                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                className="w-full h-12 border border-slate-300 dark:border-slate-600 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Kullanıcı Ayarları */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        👥 Kullanıcı Ayarları
                    </h4>
                    
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.allowRegistration || false}
                                onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                Email doğrulaması gerektir
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications || false}
                                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                Email bildirimlerini etkinleştir
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Varsayılan Kullanıcı Rolü
                        </label>
                        <select
                            value={settings.defaultUserRole || 'Viewer'}
                            onChange={(e) => handleInputChange('defaultUserRole', e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        >
                            <option value="Viewer">Görüntüleyici</option>
                            <option value="Editor">Editör</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>

                {/* Sistem Ayarları */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        🔧 Sistem Ayarları
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Oturum Süresi (Saat)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="168"
                                value={settings.sessionTimeout || 24}
                                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Maksimum Dosya Boyutu (MB)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.maxFileSize || 50}
                                onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            İzin Verilen Dosya Türleri
                        </label>
                        <input
                            type="text"
                            value={settings.allowedFileTypes || ''}
                            onChange={(e) => handleInputChange('allowedFileTypes', e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            placeholder=".jpg,.png,.pdf,.doc,.docx"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Virgülle ayırarak dosya uzantılarını belirtiniz
                        </p>
                    </div>
                </div>

                {/* Bölgesel Ayarlar */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                        🌍 Bölgesel Ayarlar
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Sistem Dili
                            </label>
                            <select
                                value={settings.systemLanguage || 'tr'}
                                onChange={(e) => handleInputChange('systemLanguage', e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            >
                                <option value="tr">Türkçe</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tarih Formatı
                            </label>
                            <select
                                value={settings.dateFormat || 'DD/MM/YYYY'}
                                onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Para Birimi
                            </label>
                            <select
                                value={settings.currency || 'TRY'}
                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            >
                                <option value="TRY">₺ TRY</option>
                                <option value="USD">$ USD</option>
                                <option value="EUR">€ EUR</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Uyarı Mesajı */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex">
                        <span className="text-amber-400 text-lg mr-3">⚠️</span>
                        <div>
                            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Önemli Not
                            </h3>
                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                <p>
                                    Sistem ayarlarını değiştirmeden önce yedek almayı unutmayın. 
                                    Bazı değişiklikler sistem yeniden başlatıldıktan sonra etkili olacaktır.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;