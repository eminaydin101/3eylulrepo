import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

const TableColumnManager = ({ currentColumns, onColumnsUpdate }) => {
    const { success } = useToast();
    const [availableColumns, setAvailableColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [draggedColumn, setDraggedColumn] = useState(null);

    const defaultColumns = [
        { key: 'id', label: 'ID', required: true },
        { key: 'firma', label: 'Firma', required: false },
        { key: 'konum', label: 'Konum', required: false },
        { key: 'baslik', label: 'Başlık', required: true },
        { key: 'surec', label: 'Süreç', required: false },
        { key: 'mevcutDurum', label: 'Mevcut Durum', required: false },
        { key: 'baslangicTarihi', label: 'Başlangıç Tarihi', required: false },
        { key: 'sonrakiKontrolTarihi', label: 'Kontrol Tarihi', required: false },
        { key: 'tamamlanmaTarihi', label: 'Tamamlanma Tarihi', required: false },
        { key: 'kategori', label: 'Kategori', required: false },
        { key: 'altKategori', label: 'Alt Kategori', required: false },
        { key: 'sorumlular', label: 'Sorumlular', required: false },
        { key: 'oncelikDuzeyi', label: 'Öncelik', required: false },
        { key: 'durum', label: 'Durum', required: true }
    ];

    useEffect(() => {
        const current = currentColumns || defaultColumns.filter(col => ['id', 'baslik', 'durum', 'baslangicTarihi', 'sorumlular'].includes(col.key));
        const currentKeys = current.map(c => c.key);
        
        setSelectedColumns(current);
        setAvailableColumns(defaultColumns.filter(col => !currentKeys.includes(col.key)));
    }, [currentColumns]);

    const handleColumnToggle = (column, isSelected) => {
        if (column.required) return; // Zorunlu sütunlar değiştirilemez

        if (isSelected) {
            // Sütunu kaldır
            setSelectedColumns(prev => prev.filter(col => col.key !== column.key));
            setAvailableColumns(prev => [...prev, column].sort((a, b) => a.label.localeCompare(b.label)));
        } else {
            // Sütunu ekle
            setAvailableColumns(prev => prev.filter(col => col.key !== column.key));
            setSelectedColumns(prev => [...prev, column]);
        }
    };

    const handleDragStart = (e, column) => {
        setDraggedColumn(column);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (!draggedColumn) return;

        const sourceIndex = selectedColumns.findIndex(col => col.key === draggedColumn.key);
        if (sourceIndex === targetIndex) return;

        const newColumns = [...selectedColumns];
        newColumns.splice(sourceIndex, 1);
        newColumns.splice(targetIndex, 0, draggedColumn);
        
        setSelectedColumns(newColumns);
        setDraggedColumn(null);
    };

    const handleSaveColumns = () => {
        onColumnsUpdate(selectedColumns);
        success('Tablo sütunları güncellendi');
    };

    const handleResetToDefault = () => {
        const defaultSelected = defaultColumns.filter(col => 
            ['id', 'baslik', 'firma', 'durum', 'baslangicTarihi', 'sorumlular'].includes(col.key)
        );
        setSelectedColumns(defaultSelected);
        setAvailableColumns(defaultColumns.filter(col => !defaultSelected.some(s => s.key === col.key)));
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    📊 Tablo Sütun Yönetimi
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={handleResetToDefault}
                        className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        🔄 Varsayılan
                    </button>
                    <button
                        onClick={handleSaveColumns}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        💾 Kaydet
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seçili Sütunlar */}
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        ✅ Görünür Sütunlar ({selectedColumns.length})
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            Sürükle & Bırak
                        </span>
                    </h4>
                    <div className="space-y-2 min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        {selectedColumns.map((column, index) => (
                            <div
                                key={column.key}
                                draggable={!column.required}
                                onDragStart={(e) => handleDragStart(e, column)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    column.required 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-move hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {!column.required && (
                                        <div className="text-slate-400 cursor-move">
                                            ⋮⋮
                                        </div>
                                    )}
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {column.label}
                                    </span>
                                    {column.required && (
                                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                            Zorunlu
                                        </span>
                                    )}
                                </div>
                                {!column.required && (
                                    <button
                                        onClick={() => handleColumnToggle(column, true)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Sütunu gizle"
                                    >
                                        ❌
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kullanılabilir Sütunlar */}
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        ➕ Kullanılabilir Sütunlar ({availableColumns.length})
                    </h4>
                    <div className="space-y-2 min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        {availableColumns.length > 0 ? availableColumns.map(column => (
                            <div
                                key={column.key}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                            >
                                <span className="font-medium text-slate-600 dark:text-slate-400">
                                    {column.label}
                                </span>
                                <button
                                    onClick={() => handleColumnToggle(column, false)}
                                    className="text-green-500 hover:text-green-700 p-1"
                                    title="Sütunu göster"
                                >
                                    ➕
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <div className="text-3xl mb-2">📊</div>
                                <p>Tüm sütunlar seçilmiş</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Kullanım İpuçları:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Sütun sırasını değiştirmek için sürükle & bırak kullanın</li>
                    <li>• Zorunlu sütunlar (ID, Başlık, Durum) gizlenemez</li>
                    <li>• Değişiklikler tüm kullanıcılar için geçerli olur</li>
                </ul>
            </div>
        </div>
    );
};

export default TableColumnManager;