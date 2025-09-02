import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const CategoryManager = ({ kategoriler, firmalar, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('categories');
    const [newCategory, setNewCategory] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const { success, error } = useToast();

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            error('Kategori adı gereklidir');
            return;
        }

        try {
            await onUpdate('addCategory', { name: newCategory.trim() });
            setNewCategory('');
            success('Kategori başarıyla eklendi');
        } catch (err) {
            error('Kategori eklenemedi');
        }
    };

    const handleAddSubCategory = async () => {
        if (!selectedCategory || !newSubCategory.trim()) {
            error('Kategori ve alt kategori adı gereklidir');
            return;
        }

        try {
            await onUpdate('addSubCategory', { 
                category: selectedCategory, 
                subCategory: newSubCategory.trim() 
            });
            setNewSubCategory('');
            success('Alt kategori başarıyla eklendi');
        } catch (err) {
            error('Alt kategori eklenemedi');
        }
    };

    const handleAddCompany = async () => {
        if (!newCompany.trim()) {
            error('Firma adı gereklidir');
            return;
        }

        try {
            await onUpdate('addCompany', { name: newCompany.trim() });
            setNewCompany('');
            success('Firma başarıyla eklendi');
        } catch (err) {
            error('Firma eklenemedi');
        }
    };

    const handleAddLocation = async () => {
        if (!selectedCompany || !newLocation.trim()) {
            error('Firma ve lokasyon adı gereklidir');
            return;
        }

        try {
            await onUpdate('addLocation', { 
                company: selectedCompany, 
                location: newLocation.trim() 
            });
            setNewLocation('');
            success('Lokasyon başarıyla eklendi');
        } catch (err) {
            error('Lokasyon eklenemedi');
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
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'categories'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    📂 Kategoriler
                </button>
                <button
                    onClick={() => setActiveTab('companies')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'companies'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    🏢 Firmalar
                </button>
            </div>

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="space-y-6">
                    {/* Add New Category */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Yeni Kategori Ekle
                        </h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Kategori adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    {/* Add Sub Category */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Alt Kategori Ekle
                        </h4>
                        <div className="flex gap-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            >
                                <option value="">Kategori Seçin</option>
                                {Object.keys(kategoriler || {}).map(kategori => (
                                    <option key={kategori} value={kategori}>{kategori}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={newSubCategory}
                                onChange={(e) => setNewSubCategory(e.target.value)}
                                placeholder="Alt kategori adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                            <button
                                onClick={handleAddSubCategory}
                                disabled={!selectedCategory}
                                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Mevcut Kategoriler
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(kategoriler || {}).map(([kategori, altKategoriler]) => (
                                <div key={kategori} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                    <div className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                                        📂 {kategori}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        {altKategoriler.map(altKategori => (
                                            <div key={altKategori} className="text-sm text-slate-600 dark:text-slate-400">
                                                └ {altKategori}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                            Yeni Firma Ekle
                        </h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                                placeholder="Firma adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                            <button
                                onClick={handleAddCompany}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    {/* Add Location */}
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Lokasyon Ekle
                        </h4>
                        <div className="flex gap-3">
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            >
                                <option value="">Firma Seçin</option>
                                {Object.keys(firmalar || {}).map(firma => (
                                    <option key={firma} value={firma}>{firma}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                placeholder="Lokasyon adı"
                                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                            <button
                                onClick={handleAddLocation}
                                disabled={!selectedCompany}
                                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    {/* Companies List */}
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Mevcut Firmalar
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(firmalar || {}).map(([firma, lokasyonlar]) => (
                                <div key={firma} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                    <div className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                                        🏢 {firma}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        {lokasyonlar.map(lokasyon => (
                                            <div key={lokasyon} className="text-sm text-slate-600 dark:text-slate-400">
                                                └ 📍 {lokasyon}
                                            </div>
                                        ))}
                                    </div>
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