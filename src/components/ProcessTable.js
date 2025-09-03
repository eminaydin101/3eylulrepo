import React from 'react';

const ProcessTable = ({ tableRows, onEdit, sortConfig, handleSort, userRole, onRowClick, visibleColumns }) => {
    const thStyle = "p-3 text-left text-xs font-semibold text-white uppercase tracking-wider bg-slate-700 dark:bg-slate-800";
    const tdStyle = "px-3 py-4 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300";

    const getPriorityRowStyle = (priority) => {
        switch (priority) {
            case 'Yüksek': return 'bg-red-100/60 dark:bg-red-900/25 hover:bg-red-100 dark:hover:bg-red-900/35 border-l-4 border-red-500';
            case 'Orta': return 'bg-yellow-100/60 dark:bg-yellow-700/25 hover:bg-yellow-100 dark:hover:bg-yellow-700/35 border-l-4 border-yellow-500';
            default: return 'bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50';
        }
    };

    const canEdit = userRole === 'Admin' || userRole === 'Editor' || userRole === 'SuperAdmin';

    // Kullanılacak sütunları belirle (eğer visibleColumns yoksa tüm sütunları göster)
    const columnsToShow = visibleColumns && visibleColumns.length > 0 ? visibleColumns : [
        { key: 'id', label: 'ID' },
        { key: 'firma', label: 'Firma' },
        { key: 'konum', label: 'Konum' },
        { key: 'baslik', label: 'Başlık' },
        { key: 'surec', label: 'Süreç' },
        { key: 'mevcutDurum', label: 'Mevcut Durum' },
        { key: 'baslangicTarihi', label: 'Başlangıç Tarihi' },
        { key: 'sonrakiKontrolTarihi', label: 'Kontrol Tarihi' },
        { key: 'tamamlanmaTarihi', label: 'Tamamlanma Tarihi' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'altKategori', label: 'Alt Kategori' },
        { key: 'sorumlular', label: 'Sorumlular' },
        { key: 'oncelikDuzeyi', label: 'Öncelik' },
        { key: 'durum', label: 'Durum' }
    ];

    const SortableHeader = ({ title, field }) => (
        <th className={thStyle}>
            <button className="flex items-center gap-1 hover:text-gray-300" onClick={() => handleSort(field)}>
                {title}
                {sortConfig && sortConfig.key === field && (
                    <span className="text-yellow-300">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                )}
                {(!sortConfig || sortConfig.key !== field) && (
                    <span className="text-gray-400">⇅</span>
                )}
            </button>
        </th>
    );

    const handleCellClick = (row, field, event) => {
        if (event.target.closest('button')) {
            return;
        }
        if (onRowClick) {
            onRowClick(row, field);
        }
    };

    const renderCellContent = (row, column) => {
        const field = column.key;
        const value = row[field];

        switch (field) {
            case 'id':
                return (
                    <span className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs">
                        {value}
                    </span>
                );

            case 'baslik':
                return (
                    <div className="min-w-[200px] font-semibold">
                        {value}
                    </div>
                );

            case 'surec':
            case 'mevcutDurum':
                return (
                    <div className="min-w-[250px]">
                        <div className="truncate max-w-xs" title={value}>
                            {value}
                        </div>
                    </div>
                );

            case 'sorumlular':
                return (
                    <div className="min-w-[150px]">
                        <div className="truncate" title={value?.join(', ')}>
                            {value?.join(', ')}
                        </div>
                    </div>
                );

            case 'oncelikDuzeyi':
                return (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        value === 'Yüksek' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                        value === 'Orta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                        {value}
                    </span>
                );

            case 'durum':
                return (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        value === 'Tamamlandı' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        value === 'İşlemde' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                        {value}
                    </span>
                );

            case 'baslangicTarihi':
            case 'sonrakiKontrolTarihi':
            case 'tamamlanmaTarihi':
                return <div className="min-w-[120px]">{value}</div>;

            default:
                return value;
        }
    };

    if (!tableRows || tableRows.length === 0) {
        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-500 dark:text-slate-400">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">Süreç Bulunamadı</h3>
                <p>Filtre kriterlerine uygun süreç bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="overflow-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-700 h-[calc(100vh-320px)]">
            <table className="min-w-full">
                <thead className="sticky top-0 z-10">
                    <tr>
                        {columnsToShow.map(column => (
                            <SortableHeader 
                                key={column.key} 
                                title={column.label} 
                                field={column.key} 
                            />
                        ))}
                        {canEdit && <th className={thStyle}>İşlemler</th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                    {tableRows.map(row => (
                        <tr key={row.id} className={`${getPriorityRowStyle(row.oncelikDuzeyi)} transition-colors duration-150`}>
                            {columnsToShow.map(column => (
                                <td 
                                    key={column.key}
                                    className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                    onClick={(e) => handleCellClick(row, column.key, e)}
                                >
                                    {renderCellContent(row, column)}
                                </td>
                            ))}
                            {canEdit && (
                                <td className={`${tdStyle} min-w-[80px]`}>
                                    <button 
                                        onClick={() => onEdit(row)} 
                                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-600 transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProcessTable;