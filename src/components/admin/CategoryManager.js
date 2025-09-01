import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../LoadingSpinner';

const CategoryManager = ({ kategoriler, firmalar, onUpdate }) => {
    const [activeSection, setActiveSection] = useState('categories');
    const [loading, setLoading] = useState(false);
    const { success, error } = useToast();
    
    // Category states
    const [newCategory, setNewCategory] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Firm states
    const [newFirm, setNewFirm] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [selectedFirm, setSelectedFirm] = useState('');
    
    // Edit states
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [editingFirm, setEditingFirm] = useState(null);
    const [editingLocation, setEditingLocation] = useState(null);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            error('Kategori adı boş olamaz');
            return;
        }
        
        setLoading(true);
        try {
            await onUpdate('ADD_CATEGORY', { name: newCategory.trim() });
            success('Yeni kategori eklendi');
            setNewCategory('');
        } catch (err) {
            error('Kategori eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim() || !selectedCategory) {
            error('Alt kategori adı ve ana kategori seçilmelidir');
            return;
        }
        
        setLoading(true);
        try {
            await onUpdate('ADD_SUBCATEGORY', { 
                category: selectedCategory, 
                subCategory: newSubCategory.trim() 
            });
            success('Yeni alt kategori eklendi');
            setNewSubCategory('');
        } catch (err) {
            error('Alt kategori eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFirm = async () => {
        if (!newFirm.trim()) {
            error('Firma adı boş olamaz');
            return;
        }
        
        setLoading(true);
        try {
            await onUpdate('ADD_FIRM', { name: newFirm.trim() });
            success('Yeni firma eklendi');
            setNewFirm('');
        } catch (err) {
            error('Firma eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = async () => {
        if (!newLocation.trim() || !selectedFirm) {
            error('Konum adı ve firma seçilmelidir');
            return;
        }
        
        setLoading(true);
        try {
            await onUpdate('ADD_LOCATION', { 
                firm: selectedFirm, 
                location: newLocation.trim() 
            });
            success('Yeni konum eklendi');
            setNewLocation('');
        } catch (err) {
            error('Konum eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (!window.confirm(`"${categoryName}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }
        
        setLoading(true);
        try {
            await onUpdate('DELETE_CATEGORY', { name: categoryName });
            success('Kategori silindi');
        } catch (err) {
            error('Kategori silinirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubCategory = async (categoryName, subCategoryName) => {
        if (!window.confirm(`"${subCategoryName}" alt kategorisini silmek istediğinizden emin misiniz?`)) {
            return;
        }
        
        setLoading(true);
        try {
            await onUpdate('DELETE_SUBCATEGORY', { 
                category: categoryName, 
                subCategory: subCategoryName 
            });
            success('Alt kategori silindi');
        } catch (err) {
            error('Alt kategori silinirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = "bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700";
    const inputStyle = "flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200";
    const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50";
    const dangerButtonStyle = "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-xs transition-colors";

    return (
        <div className="space-y-6">
            {/* Section Selector */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                    onClick={() => setActiveSection('categories')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeSection === 'categories' 
                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    📂 Kategoriler
                </button>
                <button
                    onClick={() => setActiveSection('firms')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeSection === 'firms' 
                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    🏢 Firmalar
                </button>
            </div>

            {loading && <LoadingSpinner />}

            {/* Categories Section */}
            {activeSection === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Category */}
                    <div className={`${sectionStyle} p-6`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            ➕ Yeni Kategori Ekle
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Kategori adını girin..."
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className={inputStyle}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.trim() || loading}
                                    className={buttonStyle}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add Sub Category */}
                    <div className={`${sectionStyle} p-6`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            ➕ Yeni Alt Kategori Ekle
                        </h3>
                        <div className="space-y-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className={inputStyle}
                            >
                                <option value="">Ana kategori seçin...</option>
                                {Object.keys(kategoriler).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Alt kategori adını girin..."
                                    value={newSubCategory}
                                    onChange={(e) => setNewSubCategory(e.target.value)}
                                    className={inputStyle}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubCategory()}
                                />
                                <button
                                    onClick={handleAddSubCategory}
                                    disabled={!newSubCategory.trim() || !selectedCategory || loading}
                                    className={buttonStyle}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className={`${sectionStyle} p-6 lg:col-span-2`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            📋 Mevcut Kategoriler
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(kategoriler).map(([categoryName, subCategories]) => (
                                <div key={categoryName} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <span>📂</span>
                                            {categoryName}
                                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                                                {subCategories.length}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => handleDeleteCategory(categoryName)}
                                            className={dangerButtonStyle}
                                        >
                                            🗑️ Sil
                                        </button>
                                    </div>
                                    
                                    {subCategories.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {subCategories.map(subCat => (
                                                <div key={subCat} className="bg-slate-50 dark:bg-slate-700 p-2 rounded flex items-center justify-between">
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        📄 {subCat}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteSubCategory(categoryName, subCat)}
                                                        className="text-red-600 hover:text-red-800 text-xs p-1"
                                                        title="Alt kategoriyi sil"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Firms Section */}
            {activeSection === 'firms' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Firm */}
                    <div className={`${sectionStyle} p-6`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            ➕ Yeni Firma Ekle
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Firma adını girin..."
                                    value={newFirm}
                                    onChange={(e) => setNewFirm(e.target.value)}
                                    className={inputStyle}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddFirm()}
                                />
                                <button
                                    onClick={handleAddFirm}
                                    disabled={!newFirm.trim() || loading}
                                    className={buttonStyle}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add Location */}
                    <div className={`${sectionStyle} p-6`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            ➕ Yeni Konum Ekle
                        </h3>
                        <div className="space-y-4">
                            <select
                                value={selectedFirm}
                                onChange={(e) => setSelectedFirm(e.target.value)}
                                className={inputStyle}
                            >
                                <option value="">Firma seçin...</option>
                                {Object.keys(firmalar).map(firm => (
                                    <option key={firm} value={firm}>{firm}</option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Konum adını girin..."
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    className={inputStyle}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                                />
                                <button
                                    onClick={handleAddLocation}
                                    disabled={!newLocation.trim() || !selectedFirm || loading}
                                    className={buttonStyle}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Firms List */}
                    <div className={`${sectionStyle} p-6 lg:col-span-2`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            🏢 Mevcut Firmalar
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(firmalar).map(([firmName, locations]) => (
                                <div key={firmName} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <span>🏢</span>
                                            {firmName}
                                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                                                {locations.length}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => handleDeleteCategory(firmName)}
                                            className={dangerButtonStyle}
                                        >
                                            🗑️ Sil
                                        </button>
                                    </div>
                                    
                                    {locations.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {locations.map(location => (
                                                <div key={location} className="bg-slate-50 dark:bg-slate-700 p-2 rounded flex items-center justify-between">
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        📍 {location}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteSubCategory(firmName, location)}
                                                        className="text-red-600 hover:text-red-800 text-xs p-1"
                                                        title="Konumu sil"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;