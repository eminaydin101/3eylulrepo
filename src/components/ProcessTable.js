import React from 'react';

const ProcessTable = ({ tableRows, onEdit, sortConfig, handleSort, userRole }) => {
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
            <button className="flex items-center gap-1" onClick={() => handleSort(field)}>
                {title}
                {sortConfig && sortConfig.key === field && (<span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>)}
            </button>
        </th>
    );

    if (!tableRows || tableRows.length === 0) {
        return <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-500 dark:text-slate-400">Filtre kriterlerine uygun süreç bulunamadı.</div>;
    }

    return (
        <div className="overflow-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-700 h-[calc(100vh-320px)]">
            <table className="min-w-full">
                <thead className="sticky top-0 z-10">
                    <tr>
                        <SortableHeader title="ID" field="id" />
                        <SortableHeader title="Firma" field="firma" />
                        <SortableHeader title="Başlık" field="baslik" />
                        <th className={thStyle}>Mevcut Durum</th>
                        <SortableHeader title="Başlangıç" field="baslangicTarihi" />
                        <SortableHeader title="Sonraki Kontrol" field="sonrakiKontrolTarihi" />
                        <SortableHeader title="Sorumlular" field="sorumlular" />
                        <SortableHeader title="Öncelik" field="oncelikDuzeyi" />
                        <SortableHeader title="Durum" field="durum" />
                        {canEdit && <th className={thStyle}>İşlemler</th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                    {tableRows.map(row => (
                       <tr key={row.id} className={`${getPriorityRowStyle(row.oncelikDuzeyi)} transition-colors duration-150`}>
                            <td className={`${tdStyle} font-mono text-xs`}>
                                <button onClick={() => onEdit(row)} className="text-blue-600 dark:text-blue-400 hover:underline">{row.id}</button>
                            </td>
                            <td className={tdStyle}>{row.firma}</td>
                            <td className={`${tdStyle} min-w-[200px] font-semibold`}>{row.baslik}</td>
                            <td className={`${tdStyle} min-w-[250px]`}>{row.mevcutDurum}</td>
                            <td className={`${tdStyle} min-w-[120px]`}>{row.baslangicTarihi}</td>
                            <td className={`${tdStyle} min-w-[120px]`}>{row.sonrakiKontrolTarihi}</td>
                            <td className={`${tdStyle} min-w-[150px]`}>{row.sorumlular?.join(', ')}</td>
                            <td className={tdStyle}>{row.oncelikDuzeyi}</td>
                            <td className={tdStyle}>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.durum === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{row.durum}</span>
                            </td>
                            {canEdit && (
                                <td className={`${tdStyle} min-w-[80px]`}>
                                    <button onClick={() => onEdit(row)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-600">Düzenle</button>
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