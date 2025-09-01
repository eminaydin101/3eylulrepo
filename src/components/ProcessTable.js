import React from 'react';

const ProcessTable = ({ tableRows, onEdit, sortConfig, handleSort, userRole, onRowClick }) => {
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
        // Düzenle butonuna tıklanırsa modal aç
        if (event.target.closest('button')) {
            return;
        }
        // Diğer durumlarda row click handler'ı çağır
        if (onRowClick) {
            onRowClick(row, field);
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
                        <SortableHeader title="ID" field="id" />
                        <SortableHeader title="Firma" field="firma" />
                        <SortableHeader title="Konum" field="konum" />
                        <SortableHeader title="Başlık" field="baslik" />
                        <SortableHeader title="Süreç" field="surec" />
                        <SortableHeader title="Mevcut Durum" field="mevcutDurum" />
                        <SortableHeader title="Başlangıç Tarihi" field="baslangicTarihi" />
                        <SortableHeader title="Kontrol Tarihi" field="sonrakiKontrolTarihi" />
                        <SortableHeader title="Tamamlanma Tarihi" field="tamamlanmaTarihi" />
                        <SortableHeader title="Kategori" field="kategori" />
                        <SortableHeader title="Alt Kategori" field="altKategori" />
                        <SortableHeader title="Sorumlular" field="sorumlular" />
                        <SortableHeader title="Öncelik" field="oncelikDuzeyi" />
                        <SortableHeader title="Durum" field="durum" />
                        {canEdit && <th className={thStyle}>İşlemler</th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                    {tableRows.map(row => (
                       <tr key={row.id} className={`${getPriorityRowStyle(row.oncelikDuzeyi)} transition-colors duration-150`}>
                            <td 
                                className={`${tdStyle} font-mono text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                onClick={(e) => handleCellClick(row, 'id', e)}
                            >
                                <span className="text-blue-600 dark:text-blue-400 hover:underline">{row.id}</span>
                            </td>
                            <td 
                                className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'firma', e)}
                            >
                                {row.firma}
                            </td>
                            <td 
                                className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'konum', e)}
                            >
                                {row.konum}
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[200px] font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'baslik', e)}
                            >
                                {row.baslik}
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[250px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'surec', e)}
                            >
                                <div className="truncate max-w-xs" title={row.surec}>
                                    {row.surec}
                                </div>
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[250px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'mevcutDurum', e)}
                            >
                                <div className="truncate max-w-xs" title={row.mevcutDurum}>
                                    {row.mevcutDurum}
                                </div>
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[120px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'baslangicTarihi', e)}
                            >
                                {row.baslangicTarihi}
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[120px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'sonrakiKontrolTarihi', e)}
                            >
                                {row.sonrakiKontrolTarihi}
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[120px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'tamamlanmaTarihi', e)}
                            >
                                {row.tamamlanmaTarihi}
                            </td>
                            <td 
                                className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'kategori', e)}
                            >
                                {row.kategori}
                            </td>
                            <td 
                                className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'altKategori', e)}
                            >
                                {row.altKategori}
                            </td>
                            <td 
                                className={`${tdStyle} min-w-[150px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'sorumlular', e)}
                            >
                                <div className="truncate" title={row.sorumlular?.join(', ')}>
                                    {row.sorumlular?.join(', ')}
                                </div>
                            </td>
                            <td 
                                className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'oncelikDuzeyi', e)}
                            >
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    row.oncelikDuzeyi === 'Yüksek' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                    row.oncelikDuzeyi === 'Orta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                    {row.oncelikDuzeyi}
                                </span>
                            </td>
                            <td 
                                className={`${tdStyle} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50`}
                                onClick={(e) => handleCellClick(row, 'durum', e)}
                            >
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    row.durum === 'Tamamlandı' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                    row.durum === 'İşlemde' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                    {row.durum}
                                </span>
                            </td>
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