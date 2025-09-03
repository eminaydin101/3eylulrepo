import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

const TableColumnManager = ({ currentColumns, onColumnsUpdate }) => {
    const { success, error } = useToast();
    const [availableColumns, setAvailableColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [draggedColumn, setDraggedColumn] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [editLabel, setEditLabel] = useState('');

    const defaultColumns = [
        { key: 'id', label: 'ID', required: true, customizable: false },
        { key: 'firma', label: 'Firma', required: false, customizable: true },
        { key: 'konum', label: 'Konum', required: false, customizable: true },
        { key: 'baslik', label: 'Başlık', required: true, customizable: true },
        { key: 'surec', label: 'Süreç Detayı', required: false, customizable: true },
        { key: 'mevcutDurum', label: 'Mevcut Durum', required: false, customizable: true },
        { key: 'baslangicTarihi', label: 'Başlangıç Tarihi', required: false, customizable: true },
        { key: 'sonrakiKontrolTarihi', label: 'Kontrol Tarihi', required: false, customizable: true },
        { key: 'tamamlanmaTarihi', label: 'Tamamlanma Tarihi', required: false, customizable: true },
        { key: 'kategori', label: 'Kategori', required: false, customizable: true },
        { key: 'altKategori', label: 'Alt Kategori', required: false, customizable: true },
        { key: 'sorumlular', label: 'Sorumlular', required: false, customizable: true },
        { key: 'oncelikDuzeyi', label: 'Öncelik Düzeyi', required: false, customizable: true },
        { key: 'durum', label: 'Durum', required: true, customizable: true }
    ];

    useEffect(() => {
        const current = currentColumns && currentColumns.length > 0 
            ? currentColumns 
            : defaultColumns.filter(col => ['id', 'baslik', 'durum', 'baslangicTarihi', 'sorumlular'].includes(col.key));
        
        const currentKeys = current.map(c => c.key);
        
        setSelectedColumns(current);
        setAvailableColumns(defaultColumns.filter(col => !currentKeys.includes(col.key)));
    }, [currentColumns]);

    const handleColumnToggle = (column, isSelected) => {
        if (column.required) return;

        if (isSelected) {
            setSelectedColumns(prev => prev.filter(col => col.key !== column.key));
            setAvailableColumns(prev => [...prev, column].sort((a, b) => a.label.localeCompare(b.label)));
        } else {
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

    const handleEditLabel = (column) => {
        if (!column.customizable) {
            error('Bu sütunun adı değiştirilemez');
            return;
        }
        setEditingColumn(column.key);
        setEditLabel(column.label);
    };

    const handleSaveLabel = () => {
        if (!editLabel.trim()) {
            error('Sütun adı boş olamaz');
            return;
        }

        setSelectedColumns(prev => prev.map(col => 
            col.key === editingColumn 
                ? { ...col, label: editLabel.trim() }
                : col
        ));

        setEditingColumn(null);
        setEditLabel('');
        success('Sütun adı güncellendi');
    };

    const handleSaveColumns = () => {
        // Local storage'a da kaydet
        localStorage.setItem('tableColumns', JSON.stringify(selectedColumns));
        onColumnsUpdate(selectedColumns);
        success('Tablo ayarları kaydedildi');
    };

    const handleResetToDefault = () => {
        if (window.confirm('Tablo ayarlarını varsayılan haline döndürmek istediğinizden emin misiniz?')) {
            const defaultSelected = defaultColumns.filter(col => 
                ['id', 'baslik', 'firma', 'durum', 'baslangicTarihi', 'sorumlular'].includes(col.key)
            );
            setSelectedColumns(defaultSelected);
            setAvailableColumns(defaultColumns.filter(col => !defaultSelected.some(s => s.key === col.key)));
            success('Varsayılan ayarlar yüklendi');
        }
    };

    const handleResetLabels = () => {
        if (window.confirm('Tüm sütun adlarını varsayılan haline döndürmek istediğinizden emin misiniz?')) {
            setSelectedColumns(prev => prev.map(col => {
                const defaultCol = defaultColumns.find(dc => dc.key === col.key);
                return defaultCol ? { ...col, label: defaultCol.label } : col;
            }));
            success('Sütun adları sıfırlandı');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    📊 Tablo Sütun Yönetimi
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={handleResetLabels}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        title="Sütun adlarını sıfırla"
                    >
                        🏷️ Adları Sıfırla
                    </button>
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
                            Sürükle & Düzenle
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
                                <div className="flex items-center gap-3 flex-1">
                                    {!column.required && (
                                        <div className="text-slate-400 cursor-move">
                                            ⋮⋮
                                        </div>
                                    )}
                                    
                                    {editingColumn === column.key ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveLabel()}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveLabel}
                                                className="text-green-600 hover:text-green-700 p-1"
                                                title="Kaydet"
                                            >
                                                ✅
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingColumn(null);
                                                    setEditLabel('');
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="İptal"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="font-medium text-slate-700 dark:text-slate-300 flex-1">
                                                {column.label}
                                            </span>
                                            {column.customizable && (
                                                <button
                                                    onClick={() => handleEditLabel(column)}
                                                    className="text-blue-500 hover:text-blue-700 p-1"
                                                    title="Adını düzenle"
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    
                                    {column.required && (
                                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                            Zorunlu
                                        </span>
                                    )}
                                </div>
                                {!column.required && editingColumn !== column.key && (
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
                    <li>• Sütun adlarını düzenlemek için ✏️ ikona tıklayın (zorunlu sütunlar hariç)</li>
                    <li>• Zorunlu sütunlar (ID, Başlık, Durum) gizlenemez</li>
                    <li>• Değişiklikler kaydet butonuna basıldığında tüm kullanıcılar için geçerli olur</li>
                </ul>
            </div>
        </div>
    );
};

export default TableColumnManager;