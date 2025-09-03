import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

const CategoryManager = ({ kategoriler, firmalar, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('categories');
    const [newCategory, setNewCategory] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [localKategoriler, setLocalKategoriler] = useState(kategoriler || {});
    const [localFirmalar, setLocalFirmalar] = useState(firmalar || {});
    const { success, error } = useToast();

    // Props değiştiğinde local state'i güncelle
    useEffect(() => {
        setLocalKategoriler(kategoriler || {});
        setLocalFirmalar(firmalar || {});
    }, [kategoriler, firmalar]);

    // Kategori ekleme
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            error('Kategori adı gereklidir');
            return;
        }

        if (localKategoriler[newCategory.trim()]) {
            error('Bu kategori zaten mevcut');
            return;
        }

        setLoading(true);
        try {
            const updatedKategoriler = {
                ...localKategoriler,
                [newCategory.trim()]: []
            };
            
            setLocalKategoriler(updatedKategoriler);
            
            // Parent component'e bildir
            if (onUpdate) {
                await onUpdate('ADD_CATEGORY', { 
                    name: newCategory.trim(),
                    data: updatedKategoriler 
                });
            }
            
            setNewCategory('');
            success('Kategori başarıyla eklendi');
        } catch (err) {
            error('Kategori eklenemedi: ' + (err.message || 'Bilinmeyen hata'));
            // Hata durumunda geri al
            setLocalKategoriler(kategoriler || {});
        } finally {
            setLoading(false);
        }
    };

    // Alt kategori ekleme
    const handleAddSubCategory = async () => {
        if (!selectedCategory || !newSubCategory.trim()) {
            error('Kategori ve alt kategori adı gereklidir');
            return;
        }

        if (localKategoriler[selectedCategory]?.includes(newSubCategory.trim())) {
            error('Bu alt kategori zaten mevcut');
            return;
        }

        setLoading(true);
        try {
            const updatedKategoriler = {
                ...localKategoriler,
                [selectedCategory]: [...(localKategoriler[selectedCategory] || []), newSubCategory.trim()]
            };
            
            setLocalKategoriler(updatedKategoriler);
            
            if (onUpdate) {
                await onUpdate('ADD_SUBCATEGORY', { 
                    category: selectedCategory, 
                    subCategory: newSubCategory.trim(),
                    data: updatedKategoriler 
                });
            }
            
            setNewSubCategory('');
            success('Alt kategori başarıyla eklendi');
        } catch (err) {
            error('Alt kategori eklenemedi: ' + (err.message || 'Bilinmeyen hata'));
            setLocalKategoriler(kategoriler || {});
        } finally {
            setLoading(false);
        }
    };

    // Firma ekleme
    const handleAddCompany = async () => {
        if (!newCompany.trim()) {
            error('Firma adı gereklidir');
            return;
        }

        if (localFirmalar[newCompany.trim()]) {
            error('Bu firma zaten mevcut');
            return;
        }

        setLoading(true);
        try {
            const updatedFirmalar = {
                ...localFirmalar,
                [newCompany.trim()]: []
            };
            
            setLocalFirmalar(updatedFirmalar);
            
            if (onUpdate) {
                await onUpdate('ADD_FIRM', { 
                    name: newCompany.trim(),
                    data: updatedFirmalar 
                });
            }
            
            setNewCompany('');
            success('Firma başarıyla eklendi');
        } catch (err) {
            error('Firma eklenemedi: ' + (err.message || 'Bilinmeyen hata'));
            setLocalFirmalar(firmalar || {});
        } finally {
            setLoading(false);
        }
    };

    // Lokasyon ekleme
    const handleAddLocation = async () => {
        if (!selectedCompany || !newLocation.trim()) {
            error('Firma ve lokasyon adı gereklidir');
            return;
        }

        if (localFirmalar[selectedCompany]?.includes(newLocation.trim())) {
            error('Bu lokasyon zaten mevcut');
            return;
        }

        setLoading(true);
        try {
            const updatedFirmalar = {
                ...localFirmalar,
                [selectedCompany]: [...(localFirmalar[selectedCompany] || []), newLocation.trim()]
            };
            
            setLocalFirmalar(updatedFirmalar);
            
            if (onUpdate) {
                await onUpdate('ADD_LOCATION', { 
                    company: selectedCompany, 
                    location: newLocation.trim(),
                    data: updatedFirmalar 
                });
            }
            
            setNewLocation('');
            success('Lokasyon başarıyla eklendi');
        } catch (err) {
            error('Lokasyon eklenemedi: ' + (err.message || 'Bilinmeyen hata'));
            setLocalFirmalar(firmalar || {});
        } finally {
            setLoading(false);
        }
    };

    // Kategori silme
    const handleDeleteCategory = async (categoryName) => {
        if (!window.confirm(`"${categoryName}" kategorisini ve tüm alt kategorilerini silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setLoading(true);
        try {
            const updatedKategoriler = { ...localKategoriler };
            delete updatedKategoriler[categoryName];
            
            setLocalKategoriler(updatedKategoriler);
            
            if (onUpdate) {
                await onUpdate('DELETE_CATEGORY', { 
                    name: categoryName,
                    data: updatedKategoriler 
                });
            }
            
            success('Kategori silindi');
        } catch (err) {
            error('Kategori silinemedi');
            setLocalKategoriler(kategoriler || {});
        } finally {
            setLoading(false);
        }
    };

    // Alt kategori silme
    const handleDeleteSubCategory = async (categoryName, subCategoryName) => {
        if (!window.confirm(`"${subCategoryName}" alt kategorisini silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setLoading(true);
        try {
            const updatedKategoriler = {
                ...localKategoriler,
                [categoryName]: localKategoriler[categoryName].filter(sub => sub !== subCategoryName)
            };
            
            setLocalKategoriler(updatedKategoriler);
            
            if (onUpdate) {
                await onUpdate('DELETE_SUBCATEGORY', { 
                    category: categoryName,
                    subCategory: subCategoryName,
                    data: updatedKategoriler 
                });
            }
            
            success('Alt kategori silindi');
        } catch (err) {
            error('Alt kategori silinemedi');
            setLocalKategoriler(kategoriler || {});
        } finally {
            setLoading(false);
        }
    };

    // Firma silme
    const handleDeleteCompany = async (companyName) => {
        if (!window.confirm(`"${companyName}" firmasını ve tüm lokasyonlarını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setLoading(true);
        try {
            const updatedFirmalar = { ...localFirmalar };
            delete updatedFirmalar[companyName];
            
            setLocalFirmalar(updatedFirmalar);
            
            if (onUpdate) {
                await onUpdate('DELETE_COMPANY', { 
                    name: companyName,
                    data: updatedFirmalar 
                });
            }
            
            success('Firma silindi');
        } catch (err) {
            error('Firma silinemedi');
            setLocalFirmalar(firmalar || {});
        } finally {
            setLoading(false);
        }
    };

    // Lokasyon silme
    const handleDeleteLocation = async (companyName, locationName) => {
        if (!window.confirm(`"${locationName}" lokasyonunu silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setLoading(true);
        try {
            const updatedFirmalar = {
                ...localFirmalar,
                [companyName]: localFirmalar[companyName].filter(loc => loc !== locationName)
            };
            
            setLocalFirmalar(updatedFirmalar);
            
            if (onUpdate) {
                await onUpdate('DELETE_LOCATION', { 
                    company: companyName,
                    location: locationName,
                    data: updatedFirmalar 
                });
            }
            
            success('Lokasyon silindi');
        } catch (err) {
            error('Lokasyon silinemedi');
            setLocalFirmalar(firmalar || {});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                📂 Kategori & Firma Yönetimi
            </h3>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setActiveTab('categories')}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                        activeTab === 'categories'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    📂 Kategoriler
                </button>
                <button
                    onClick={() => setActiveTab('companies')}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                        activeTab === 'companies'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    🏢 Firmalar
                </button>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-slate-700 dark:text-slate-300">İşlem yapılıyor...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="space-y-6">
                    {/* Add New Category */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            ➕ Yeni Kategori Ekle
                        </h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Kategori adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddCategory()}
                                disabled={loading}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={loading || !newCategory.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '⏳' : '✅'} Ekle
                            </button>
                        </div>
                    </div>

                    {/* Add Sub Category */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            🏷️ Alt Kategori Ekle
                        </h4>
                        <div className="flex gap-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                disabled={loading}
                            >
                                <option value="">Kategori Seçin</option>
                                {Object.keys(localKategoriler).map(kategori => (
                                    <option key={kategori} value={kategori}>{kategori}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={newSubCategory}
                                onChange={(e) => setNewSubCategory(e.target.value)}
                                placeholder="Alt kategori adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddSubCategory()}
                                disabled={loading}
                            />
                            <button
                                onClick={handleAddSubCategory}
                                disabled={loading || !selectedCategory || !newSubCategory.trim()}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '⏳' : '✅'} Ekle
                            </button>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            📋 Mevcut Kategoriler ({Object.keys(localKategoriler).length})
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(localKategoriler).map(([kategori, altKategoriler]) => (
                                <div key={kategori} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium text-slate-800 dark:text-slate-200 text-lg">
                                            📂 {kategori}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCategory(kategori)}
                                            disabled={loading}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                            title="Kategoriyi Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="ml-4 space-y-2">
                                        {altKategoriler.length > 0 ? (
                                            altKategoriler.map(altKategori => (
                                                <div key={altKategori} className="flex items-center justify-between bg-slate-100 dark:bg-slate-600 px-3 py-2 rounded">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        └ {altKategori}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteSubCategory(kategori, altKategori)}
                                                        disabled={loading}
                                                        className="text-red-500 hover:text-red-700 text-sm p-1 rounded transition-colors disabled:opacity-50"
                                                        title="Alt Kategoriyi Sil"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                Alt kategori bulunmuyor
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(localKategoriler).length === 0 && (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <div className="text-4xl mb-2">📂</div>
                                    <p>Henüz kategori eklenmemiş</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Companies Tab */}
            {activeTab === 'companies' && (
                <div className="space-y-6">
                    {/* Add New Company */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            ➕ Yeni Firma Ekle
                        </h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                                placeholder="Firma adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddCompany()}
                                disabled={loading}
                            />
                            <button
                                onClick={handleAddCompany}
                                disabled={loading || !newCompany.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '⏳' : '✅'} Ekle
                            </button>
                        </div>
                    </div>

                    {/* Add Location */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            📍 Lokasyon Ekle
                        </h4>
                        <div className="flex gap-3">
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                disabled={loading}
                            >
                                <option value="">Firma Seçin</option>
                                {Object.keys(localFirmalar).map(firma => (
                                    <option key={firma} value={firma}>{firma}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                placeholder="Lokasyon adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleAddLocation()}
                                disabled={loading}
                            />
                            <button
                                onClick={handleAddLocation}
                                disabled={loading || !selectedCompany || !newLocation.trim()}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '⏳' : '✅'} Ekle
                            </button>
                        </div>
                    </div>

                    {/* Companies List */}
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            🏢 Mevcut Firmalar ({Object.keys(localFirmalar).length})
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(localFirmalar).map(([firma, lokasyonlar]) => (
                                <div key={firma} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium text-slate-800 dark:text-slate-200 text-lg">
                                            🏢 {firma}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCompany(firma)}
                                            disabled={loading}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                            title="Firmayı Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="ml-4 space-y-2">
                                        {lokasyonlar.length > 0 ? (
                                            lokasyonlar.map(lokasyon => (
                                                <div key={lokasyon} className="flex items-center justify-between bg-slate-100 dark:bg-slate-600 px-3 py-2 rounded">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        └ 📍 {lokasyon}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteLocation(firma, lokasyon)}
                                                        disabled={loading}
                                                        className="text-red-500 hover:text-red-700 text-sm p-1 rounded transition-colors disabled:opacity-50"
                                                        title="Lokasyonu Sil"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                Lokasyon bulunmuyor
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(localFirmalar).length === 0 && (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <div className="text-4xl mb-2">🏢</div>
                                    <p>Henüz firma eklenmemiş</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bilgi Paneli */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Kullanım İpuçları:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Kategori ve firmalar süreç oluştururken kullanılabilir</li>
                    <li>• Silme işlemleri geri alınamaz, dikkatli olun</li>
                    <li>• Alt kategori ve lokasyonlar ana kategoriye bağlıdır</li>
                    <li>• Değişiklikler anında kaydedilir ve tüm kullanıcılar için geçerli olur</li>
                </ul>
            </div>
        </div>
    );
};

export default CategoryManager;