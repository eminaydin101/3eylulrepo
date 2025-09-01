import React, { useState } from 'react';

const AdvancedFilter = ({ filters, onFilterChange, users, firmalar, kategoriler, onReset }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);

    const handleTempFilterChange = (name, value) => {
        setTempFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        Object.keys(tempFilters).forEach(key => {
            onFilterChange(key, tempFilters[key]);
        });
        setIsExpanded(false);
    };

    const resetFilters = () => {
        const emptyFilters = {
            searchTerm: '',
            firma: 'all',
            kategori: 'all',
            sorumlu: 'all',
            durum: 'all',
            oncelik: 'all',
            startDate: '',
            endDate: '',
            controlStartDate: '',
            controlEndDate: ''
        };
        setTempFilters(emptyFilters);
        onReset();
        setIsExpanded(false);
    };

    const clearSingleFilter = (filterName) => {
        const clearedValue = filterName.includes('Date') ? '' : 'all';
        handleTempFilterChange(filterName, clearedValue);
        onFilterChange(filterName, clearedValue);
    };

    const inputStyle = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    const getActiveFilterCount = () => {
        return Object.values(filters).filter(value => value && value !== 'all').length;
    };

    const getActiveFilters = () => {
        const activeFilters = [];
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                const filterLabels = {
                    searchTerm: 'Arama',
                    firma: 'Firma',
                    kategori: 'Kategori', 
                    sorumlu: 'Sorumlu',
                    durum: 'Durum',
                    oncelik: 'Öncelik',
                    startDate: 'Başlangıç (Başlangıç)',
                    endDate: 'Başlangıç (Bitiş)',
                    controlStartDate: 'Kontrol (Başlangıç)',
                    controlEndDate: 'Kontrol (Bitiş)'
                };
                activeFilters.push({
                    key,
                    label: filterLabels[key],
                    value: value.length > 20 ? value.substring(0, 20) + '...' : value
                });
            }
        });
        return activeFilters;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            🔍 Gelişmiş Filtreler
                        </h3>
                        {getActiveFilterCount() > 0 && (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                                {getActiveFilterCount()} aktif filtre
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {getActiveFilterCount() > 0 && (
                            <button
                                onClick={resetFilters}
                                className="text-red-600 hover:text-red-700 font-medium text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg transition-colors"
                                title="Tüm filtreleri temizle"
                            >
                                🗑️ Tümünü Temizle
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <span>{isExpanded ? 'Daralt' : 'Genişlet'}</span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                ⌄
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 self-center">
                            Aktif filtreler:
                        </span>
                        {getActiveFilters().map(filter => (
                            <span
                                key={filter.key}
                                className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full"
                            >
                                <span>
                                    <strong>{filter.label}:</strong> {filter.value}
                                </span>
                                <button
                                    onClick={() => clearSingleFilter(filter.key)}
                                    className="hover:text-blue-900 dark:hover:text-blue-100"
                                    title={`${filter.label} filtresini kaldır`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Basic Filters - Always Visible */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <label className={labelStyle}>Genel Arama</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Başlık, açıklama, ID..."
                                value={tempFilters.searchTerm}
                                onChange={(e) => handleTempFilterChange('searchTerm', e.target.value)}
                                className={inputStyle}
                            />
                            {tempFilters.searchTerm && (
                                <button
                                    onClick={() => clearSingleFilter('searchTerm')}
                                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <label className={labelStyle}>Firma</label>
                        <div className="relative">
                            <select
                                value={tempFilters.firma}
                                onChange={(e) => handleTempFilterChange('firma', e.target.value)}
                                className={inputStyle}
                            >
                                <option value="all">Tüm Firmalar</option>
                                {Object.keys(firmalar).map(firma => (
                                    <option key={firma} value={firma}>{firma}</option>
                                ))}
                            </select>
                            {tempFilters.firma !== 'all' && (
                                <button
                                    onClick={() => clearSingleFilter('firma')}
                                    className="absolute right-8 top-2 text-slate-400 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <label className={labelStyle}>Kategori</label>
                        <div className="relative">
                            <select
                                value={tempFilters.kategori}
                                onChange={(e) => handleTempFilterChange('kategori', e.target.value)}
                                className={inputStyle}
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {Object.keys(kategoriler).map(kategori => (
                                    <option key={kategori} value={kategori}>{kategori}</option>
                                ))}
                            </select>
                            {tempFilters.kategori !== 'all' && (
                                <button
                                    onClick={() => clearSingleFilter('kategori')}
                                    className="absolute right-8 top-2 text-slate-400 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <label className={labelStyle}>Sorumlu</label>
                        <div className="relative">
                            <select
                                value={tempFilters.sorumlu}
                                onChange={(e) => handleTempFilterChange('sorumlu', e.target.value)}
                                className={inputStyle}
                            >
                                <option value="all">Tüm Sorumlular</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.fullName}>{user.fullName}</option>
                                ))}
                            </select>
                            {tempFilters.sorumlu !== 'all' && (
                                <button
                                    onClick={() => clearSingleFilter('sorumlu')}
                                    className="absolute right-8 top-2 text-slate-400 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters - Expandable */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <label className={labelStyle}>Durum</label>
                            <div className="relative">
                                <select
                                    value={tempFilters.durum}
                                    onChange={(e) => handleTempFilterChange('durum', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="all">Tüm Durumlar</option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="İşlemde">İşlemde</option>
                                    <option value="Tamamlandı">Tamamlandı</option>
                                </select>
                                {tempFilters.durum !== 'all' && (
                                    <button
                                        onClick={() => clearSingleFilter('durum')}
                                        className="absolute right-8 top-2 text-slate-400 hover:text-slate-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <label className={labelStyle}>Öncelik</label>
                            <div className="relative">
                                <select
                                    value={tempFilters.oncelik}
                                    onChange={(e) => handleTempFilterChange('oncelik', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="all">Tüm Öncelikler</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Orta">Orta</option>
                                    <option value="Yüksek">Yüksek</option>
                                </select>
                                {tempFilters.oncelik !== 'all' && (
                                    <button
                                        onClick={() => clearSingleFilter('oncelik')}
                                        className="absolute right-8 top-2 text-slate-400 hover:text-slate-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {['startDate', 'endDate', 'controlStartDate', 'controlEndDate'].map((dateField) => {
                            const labels = {
                                startDate: 'Başlangıç Tarihi (Başlangıç)',
                                endDate: 'Başlangıç Tarihi (Bitiş)',
                                controlStartDate: 'Kontrol Tarihi (Başlangıç)', 
                                controlEndDate: 'Kontrol Tarihi (Bitiş)'
                            };
                            
                            return (
                                <div key={dateField} className="relative">
                                    <label className={labelStyle}>{labels[dateField]}</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={tempFilters[dateField]}
                                            onChange={(e) => handleTempFilterChange(dateField, e.target.value)}
                                            className={inputStyle}
                                        />
                                        {tempFilters[dateField] && (
                                            <button
                                                onClick={() => clearSingleFilter(dateField)}
                                                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-medium"
                        >
                            🗑️ Temizle
                        </button>
                        <button
                            onClick={applyFilters}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            🔍 Filtreleri Uygula
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilter;