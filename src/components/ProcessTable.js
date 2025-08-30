import React from 'react';

const ProcessTable = ({ tableRows, onEdit, sortConfig, handleSort, userRole }) => {
    // Stil tanımlamaları
    const thStyle = "p-3 text-left text-xs font-semibold text-white uppercase tracking-wider bg-slate-700 dark:bg-slate-800";
    // Satırlar arasına boşluk eklemek için `py-4` kullanıyoruz ve td stilini güncelliyoruz
    const tdStyle = "px-3 py-4 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300";

    const getPriorityRowStyle = (priority) => {
        switch (priority) {
            case 'Yüksek': return 'bg-red-100/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-l-4 border-red-500';
            case 'Orta': return 'bg-yellow-100/50 dark:bg-yellow-700/20 hover:bg-yellow-100 dark:hover:bg-yellow-700/30 border-l-4 border-yellow-500';
            default: return 'bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50';
        }
    };

    const canEdit = userRole === 'Admin' || userRole === 'Editor' || userRole === 'SuperAdmin';

    // Sıralanabilir başlık bileşeni
    const SortableHeader = ({ title, field }) => (
        <th className={thStyle}>
            <button className="flex items-center gap-1" onClick={() => handleSort(field)}>
                {title}
                {sortConfig && sortConfig.key === field ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}
            </button>
        </th>
    );

    if (!tableRows || tableRows.length === 0) {
        return <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-500 dark:text-slate-400">Gösterilecek süreç bulunamadı.</div>;
    }

    return (
        <div className="overflow-x-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-8">
            <table className="min-w-full">
                <thead className="sticky top-0 z-10">
                    <tr>
                        {/* İstediğiniz tüm başlıklar eklendi */}
                        <th className={thStyle}>ID</th>
                        <th className={thStyle}>Firma</th>
                        <th className={thStyle}>Konum</th>
                        <th className={thStyle}>Başlık</th>
                        <th className={thStyle}>Mevcut Durum</th>
                        <SortableHeader title="Başlangıç" field="baslangicTarihi" />
                        <SortableHeader title="Sonraki Kontrol" field="sonrakiKontrolTarihi" />
                        <th className={thStyle}>Tamamlanma</th>
                        <th className={thStyle}>Kategori</th>
                        <th className={thStyle}>Alt Kategori</th>
                        <th className={thStyle}>Sorumlular</th>
                        <th className={thStyle}>Öncelik</th>
                        <th className={thStyle}>Durum</th>
                        {canEdit && <th className={thStyle}>İşlemler</th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                    {tableRows.map(row => (
                        <tr key={row.id} className={`${getPriorityRowStyle(row.oncelikDuzeyi)} transition-colors duration-150`}>
                            <td className={`${tdStyle} font-mono text-xs`}>{row.id}</td>
                            <td className={tdStyle}>{row.firma}</td>
                            <td className={tdStyle}>{row.konum}</td>
                            <td className={`${tdStyle} min-w-[200px] font-semibold`}>{row.baslik}</td>
                            <td className={`${tdStyle} min-w-[250px]`}>{row.mevcutDurum}</td>
                            <td className={`${tdStyle} min-w-[120px]`}>{row.baslangicTarihi}</td>
                            <td className={`${tdStyle} min-w-[120px]`}>{row.sonrakiKontrolTarihi}</td>
                            <td className={`${tdStyle} min-w-[120px]`}>{row.tamamlanmaTarihi}</td>
                            <td className={tdStyle}>{row.kategori}</td>
                            <td className={tdStyle}>{row.altKategori}</td>
                            <td className={`${tdStyle} min-w-[150px]`}>{row.sorumlular?.join(', ')}</td>
                            <td className={tdStyle}>{row.oncelikDuzeyi}</td>
                            <td className={tdStyle}>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${row.durum === 'Tamamlandı' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                                     row.durum === 'İşlemde' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700/50 dark:text-yellow-300' : 
                                     'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                    {row.durum}
                                </span>
                            </td>
                            {canEdit && (
                                <td className={`${tdStyle} min-w-[80px]`}>
                                    <button onClick={() => onEdit(row)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-600 transition-colors">
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