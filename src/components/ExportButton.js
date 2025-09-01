import React, { useState } from 'react';
import { exportToExcel, exportToPDF, exportToCSV } from '../utils/exportUtils';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';

const ExportButton = ({ data, filename = 'surecler' }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [exporting, setExporting] = useState(null);
    const { success, error } = useToast();

    const handleExport = async (format) => {
        if (!data || data.length === 0) {
            error('Dışa aktarılacak veri bulunamadı');
            return;
        }

        setExporting(format);
        setIsDropdownOpen(false);

        try {
            switch (format) {
                case 'excel':
                    await exportToExcel(data, filename);
                    success(`${data.length} kayıt Excel dosyası olarak indirildi`);
                    break;
                case 'pdf':
                    await exportToPDF(data, filename);
                    success('PDF raporu oluşturuluyor...');
                    break;
                case 'csv':
                    await exportToCSV(data, filename);
                    success(`${data.length} kayıt CSV dosyası olarak indirildi`);
                    break;
                default:
                    error('Geçersiz format');
            }
        } catch (err) {
            error(err.message || 'Dışa aktarma hatası');
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={exporting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
                {exporting ? (
                    <>
                        <LoadingSpinner size="sm" />
                        <span>Dışa Aktarılıyor...</span>
                    </>
                ) : (
                    <>
                        <span>📊</span>
                        <span>Dışa Aktar</span>
                        <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>⌄</span>
                    </>
                )}
            </button>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[150px]">
                    <button
                        onClick={() => handleExport('excel')}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
                    >
                        <span>📊</span>
                        <span>Excel</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
                    >
                        <span>📄</span>
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300 rounded-b-lg"
                    >
                        <span>📋</span>
                        <span>CSV</span>
                    </button>
                </div>
            )}

            {/* Dropdown dışına tıklanınca kapat */}
            {isDropdownOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}
        </div>
    );
};

export default ExportButton;