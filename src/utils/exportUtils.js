import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export') => {
    try {
        // Verileri Excel formatına uygun hale getir
        const processedData = data.map(item => ({
            'Süreç ID': item.id,
            'Firma': item.firma,
            'Konum': item.konum,
            'Başlık': item.baslik,
            'Kategori': item.kategori,
            'Alt Kategori': item.altKategori,
            'Başlangıç Tarihi': item.baslangicTarihi,
            'Sonraki Kontrol': item.sonrakiKontrolTarihi,
            'Tamamlanma Tarihi': item.tamamlanmaTarihi,
            'Durum': item.durum,
            'Öncelik': item.oncelikDuzeyi,
            'Sorumlular': item.sorumlular?.join(', ') || '',
            'Süreç Detayı': item.surec,
            'Mevcut Durum': item.mevcutDurum
        }));

        const ws = XLSX.utils.json_to_sheet(processedData);
        
        // Sütun genişliklerini ayarla
        const colWidths = [
            { wch: 12 }, // Süreç ID
            { wch: 15 }, // Firma
            { wch: 12 }, // Konum
            { wch: 30 }, // Başlık
            { wch: 15 }, // Kategori
            { wch: 20 }, // Alt Kategori
            { wch: 15 }, // Başlangıç
            { wch: 15 }, // Sonraki Kontrol
            { wch: 15 }, // Tamamlanma
            { wch: 12 }, // Durum
            { wch: 10 }, // Öncelik
            { wch: 25 }, // Sorumlular
            { wch: 40 }, // Süreç Detayı
            { wch: 40 }  // Mevcut Durum
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Süreçler');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
        
        return true;
    } catch (error) {
        console.error('Excel export error:', error);
        throw new Error('Excel dışa aktarma hatası');
    }
};

export const exportToPDF = async (data, filename = 'export') => {
    try {
        // PDF için HTML oluştur
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Süreç Raporu</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .priority-high { background-color: #fee2e2; }
                    .priority-medium { background-color: #fef3c7; }
                    .status-completed { background-color: #d1fae5; }
                    .status-active { background-color: #dbeafe; }
                    .status-processing { background-color: #fed7aa; }
                </style>
            </head>
            <body>
                <h1>Süreç Yönetimi Raporu</h1>
                <p>Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
                <p>Toplam Süreç Sayısı: ${data.length}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Firma</th>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Başlangıç</th>
                            <th>Durum</th>
                            <th>Öncelik</th>
                            <th>Sorumlular</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr class="
                                ${item.oncelikDuzeyi === 'Yüksek' ? 'priority-high' : 
                                  item.oncelikDuzeyi === 'Orta' ? 'priority-medium' : ''}
                                ${item.durum === 'Tamamlandı' ? 'status-completed' : 
                                  item.durum === 'Aktif' ? 'status-active' : 
                                  item.durum === 'İşlemde' ? 'status-processing' : ''}
                            ">
                                <td>${item.id}</td>
                                <td>${item.firma}</td>
                                <td>${item.baslik}</td>
                                <td>${item.kategori}</td>
                                <td>${item.baslangicTarihi}</td>
                                <td>${item.durum}</td>
                                <td>${item.oncelikDuzeyi}</td>
                                <td>${item.sorumlular?.join(', ') || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        // Yeni pencerede PDF oluştur
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        return true;
    } catch (error) {
        console.error('PDF export error:', error);
        throw new Error('PDF dışa aktarma hatası');
    }
};

export const exportToCSV = (data, filename = 'export') => {
    try {
        const headers = [
            'Süreç ID', 'Firma', 'Konum', 'Başlık', 'Kategori', 'Alt Kategori',
            'Başlangıç Tarihi', 'Sonraki Kontrol', 'Tamamlanma Tarihi', 
            'Durum', 'Öncelik', 'Sorumlular', 'Süreç Detayı', 'Mevcut Durum'
        ];

        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.id,
                item.firma,
                item.konum,
                `"${item.baslik?.replace(/"/g, '""') || ''}"`,
                item.kategori,
                item.altKategori,
                item.baslangicTarihi,
                item.sonrakiKontrolTarihi,
                item.tamamlanmaTarihi,
                item.durum,
                item.oncelikDuzeyi,
                `"${item.sorumlular?.join(', ') || ''}"`,
                `"${item.surec?.replace(/"/g, '""') || ''}"`,
                `"${item.mevcutDurum?.replace(/"/g, '""') || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    } catch (error) {
        console.error('CSV export error:', error);
        throw new Error('CSV dışa aktarma hatası');
    }
};