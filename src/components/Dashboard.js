import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, AreaChart, Area } from 'recharts';
import { useToast } from '../context/ToastContext';

const Dashboard = ({ processes, users, logs, onFilterApply }) => {
    const { success } = useToast();
    const [reportType, setReportType] = useState('summary'); // 'summary', 'detailed', 'trends'
    const [selectedPeriod, setSelectedPeriod] = useState('30'); // son 30 gün
    const chartTextStyle = { fontSize: '12px', fill: '#64748b' };
    const sectionStyle = "card-modern p-6";
    const titleStyle = "text-xl font-semibold heading-modern mb-4 text-center";

    // Temel veriler
    const activeProcesses = useMemo(() => processes.filter(p => p.durum !== 'Tamamlandı'), [processes]);
    const completedProcesses = useMemo(() => processes.filter(p => p.durum === 'Tamamlandı'), [processes]);

    // Zaman bazlı filtreler
    const getFilteredProcesses = (days) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return processes.filter(p => new Date(p.baslangicTarihi) >= cutoffDate);
    };

    // Gelişmiş istatistikler
    const advancedStats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisYear = new Date(now.getFullYear(), 0, 1);

        // Tamamlanan süreçler - zaman dilimlerine göre
        const completedToday = completedProcesses.filter(p => p.tamamlanmaTarihi && new Date(p.tamamlanmaTarihi) >= today).length;
        const completedThisWeek = completedProcesses.filter(p => p.tamamlanmaTarihi && new Date(p.tamamlanmaTarihi) >= thisWeek).length;
        const completedThisMonth = completedProcesses.filter(p => p.tamamlanmaTarihi && new Date(p.tamamlanmaTarihi) >= thisMonth).length;
        const completedThisYear = completedProcesses.filter(p => p.tamamlanmaTarihi && new Date(p.tamamlanmaTarihi) >= thisYear).length;

        // Geciken süreçler
        const overdueProcesses = activeProcesses.filter(p => p.sonrakiKontrolTarihi && new Date(p.sonrakiKontrolTarihi) < now);
        const upcomingProcesses = activeProcesses.filter(p => {
            if (!p.sonrakiKontrolTarihi) return false;
            const controlDate = new Date(p.sonrakiKontrolTarihi);
            const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
            return controlDate >= now && controlDate <= weekFromNow;
        });

        // Performans metrikleri
        const avgCompletionTime = completedProcesses.reduce((sum, p) => {
            if (p.baslangicTarihi && p.tamamlanmaTarihi) {
                const start = new Date(p.baslangicTarihi);
                const end = new Date(p.tamamlanmaTarihi);
                return sum + (end - start) / (1000 * 60 * 60 * 24); // günler
            }
            return sum;
        }, 0) / (completedProcesses.length || 1);

        // Kullanıcı aktivitesi
        const activeUsers = users.filter(u => u.status === 'Active');
        const userWorkload = activeUsers.map(user => ({
            name: user.fullName,
            active: activeProcesses.filter(p => p.sorumlular?.includes(user.fullName)).length,
            completed: completedProcesses.filter(p => p.sorumlular?.includes(user.fullName)).length
        }));

        // Kategori ve firma bazında dağılım
        const categoryStats = Object.entries(processes.reduce((acc, p) => {
            acc[p.kategori] = (acc[p.kategori] || 0) + 1;
            return acc;
        }, {})).map(([name, value]) => ({ name, value, active: activeProcesses.filter(p => p.kategori === name).length }));

        const firmStats = Object.entries(processes.reduce((acc, p) => {
            acc[p.firma] = (acc[p.firma] || 0) + 1;
            return acc;
        }, {})).map(([name, value]) => ({ name, value, active: activeProcesses.filter(p => p.firma === name).length }));

        return {
            completedToday,
            completedThisWeek,
            completedThisMonth,
            completedThisYear,
            overdueProcesses: overdueProcesses.length,
            upcomingProcesses: upcomingProcesses.length,
            avgCompletionTime: Math.round(avgCompletionTime),
            userWorkload: userWorkload.filter(u => u.active > 0 || u.completed > 0),
            categoryStats,
            firmStats,
            overdueList: overdueProcesses.slice(0, 10),
            upcomingList: upcomingProcesses.slice(0, 10)
        };
    }, [processes, activeProcesses, completedProcesses, users]);

    // Trend verileri - son 30 gün
    const trendData = useMemo(() => {
        const days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().slice(0, 10);
        });

        return days.map(date => {
            const completed = completedProcesses.filter(p => p.tamamlanmaTarihi === date).length;
            const started = processes.filter(p => p.baslangicTarihi === date).length;
            return {
                date: new Date(date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
                completed,
                started,
                net: started - completed
            };
        });
    }, [processes, completedProcesses]);

    // Rapor oluşturma fonksiyonu
    const generateReport = (type) => {
        const reportData = {
            type,
            date: new Date().toISOString(),
            period: selectedPeriod,
            summary: {
                totalProcesses: processes.length,
                activeProcesses: activeProcesses.length,
                completedProcesses: completedProcesses.length,
                overdueProcesses: advancedStats.overdueProcesses,
                avgCompletionTime: advancedStats.avgCompletionTime
            },
            breakdown: {
                byCategory: advancedStats.categoryStats,
                byFirm: advancedStats.firmStats,
                byUser: advancedStats.userWorkload
            },
            trends: trendData,
            details: type === 'detailed' ? processes : null
        };

        // JSON raporu indir
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `surecler-raporu-${type}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        success(`${type === 'summary' ? 'Özet' : type === 'detailed' ? 'Detaylı' : 'Trend'} rapor indirildi`);
    };

    // Excel raporu oluşturma
    const generateExcelReport = () => {
        const csvData = processes.map(p => ({
            'Süreç ID': p.id,
            'Firma': p.firma,
            'Kategori': p.kategori,
            'Başlık': p.baslik,
            'Durum': p.durum,
            'Öncelik': p.oncelikDuzeyi,
            'Başlangıç': p.baslangicTarihi,
            'Kontrol': p.sonrakiKontrolTarihi,
            'Tamamlanma': p.tamamlanmaTarihi,
            'Sorumlular': p.sorumlular?.join(', ') || ''
        }));

        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `surecler-detay-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        success('Excel raporu indirildi');
    };

    const PRIORITY_COLORS = { 'Yüksek': '#EF4444', 'Orta': '#F59E0B', 'Normal': '#3B82F6' };
    const STATUS_COLORS = { 'Aktif': '#3B82F6', 'İşlemde': '#F59E0B', 'Tamamlandı': '#10B981' };

    const handleChartClick = (filterType, filterValue) => {
        if (onFilterApply) {
            onFilterApply(filterType, filterValue);
        }
    };

    return (
        <div className="space-y-8">
            {/* Rapor Kontrolleri */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">📊 Dashboard & Raporlar</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={selectedPeriod} 
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-200"
                    >
                        <option value="7">Son 7 gün</option>
                        <option value="30">Son 30 gün</option>
                        <option value="90">Son 90 gün</option>
                        <option value="365">Son 1 yıl</option>
                    </select>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => generateReport('summary')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            📄 Özet Rapor
                        </button>
                        <button 
                            onClick={() => generateReport('detailed')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            📊 Detaylı Rapor
                        </button>
                        <button 
                            onClick={generateExcelReport}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            📈 Excel Rapor
                        </button>
                    </div>
                </div>
            </div>

            {/* Gelişmiş Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                <div className="card-modern p-6 text-center hover-lift cursor-pointer gradient-primary text-white" onClick={() => handleChartClick('durum', 'Aktif')}>
                    <div className="text-3xl mb-2">🔄</div>
                    <h4 className="text-sm font-medium opacity-90">Aktif Süreçler</h4>
                    <p className="text-4xl font-bold">{activeProcesses.length}</p>
                </div>

                <div className="card-modern p-6 text-center hover-lift cursor-pointer" onClick={() => handleChartClick('completed_this_week', 'true')}>
                    <div className="text-3xl mb-2 text-green-500">✅</div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Bu Hafta Tamamlanan</h4>
                    <p className="text-4xl font-bold text-green-600">{advancedStats.completedThisWeek}</p>
                    <p className="text-xs text-slate-500">Bu ay: {advancedStats.completedThisMonth}</p>
                </div>

                <div className="card-modern p-6 text-center hover-lift cursor-pointer" onClick={() => handleChartClick('overdue', 'true')}>
                    <div className="text-3xl mb-2 text-red-500">⚠️</div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Geciken Süreçler</h4>
                    <p className="text-4xl font-bold text-red-600">{advancedStats.overdueProcesses}</p>
                </div>

                <div className="card-modern p-6 text-center hover-lift">
                    <div className="text-3xl mb-2 text-blue-500">⏰</div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">7 Gün İçinde</h4>
                    <p className="text-4xl font-bold text-blue-600">{advancedStats.upcomingProcesses}</p>
                </div>

                <div className="card-modern p-6 text-center hover-lift">
                    <div className="text-3xl mb-2 text-purple-500">📊</div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Ort. Tamamlanma</h4>
                    <p className="text-4xl font-bold text-purple-600">{advancedStats.avgCompletionTime}</p>
                    <p className="text-xs text-slate-500">gün</p>
                </div>

                <div className="card-modern p-6 text-center hover-lift">
                    <div className="text-3xl mb-2 text-indigo-500">👥</div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Aktif Kullanıcı</h4>
                    <p className="text-4xl font-bold text-indigo-600">{users.filter(u => u.status === 'Active').length}</p>
                    <p className="text-xs text-slate-500">Toplam: {users.length}</p>
                </div>
            </div>

            {/* Trend Grafikleri */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>📈 30 Günlük Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={trendData}>
                            <XAxis dataKey="date" stroke="#64748b" tick={chartTextStyle} />
                            <YAxis stroke="#64748b" tick={chartTextStyle} />
                            <Tooltip wrapperClassName="!bg-white/95 dark:!bg-slate-700/95 !border-slate-300 dark:!border-slate-600 !rounded-xl !shadow-modern" />
                            <Area type="monotone" dataKey="started" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="completed" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                            <Line type="monotone" dataKey="net" stroke="#f59e0b" strokeWidth={2} />
                            <Legend />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className={sectionStyle}>
                    <h3 className={titleStyle}>🎯 Kullanıcı Performansı</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={advancedStats.userWorkload.slice(0, 8)}>
                            <XAxis dataKey="name" stroke="#64748b" tick={chartTextStyle} />
                            <YAxis stroke="#64748b" tick={chartTextStyle} />
                            <Tooltip wrapperClassName="!bg-white/95 dark:!bg-slate-700/95 !border-slate-300 dark:!border-slate-600 !rounded-xl !shadow-modern" />
                            <Bar dataKey="active" fill="#3b82f6" name="Aktif" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completed" fill="#10b981" name="Tamamlanan" radius={[4, 4, 0, 0]} />
                            <Legend />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Kategori ve Firma Dağılımları */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>📂 Kategoriye Göre Dağılım</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={advancedStats.categoryStats}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({name, value}) => `${name}: ${value}`}
                                onClick={(data) => handleChartClick('kategori', data.name)}
                            >
                                {advancedStats.categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} className="cursor-pointer hover:opacity-80" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className={sectionStyle}>
                    <h3 className={titleStyle}>🏢 Firmaya Göre Dağılım</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={advancedStats.firmStats}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({name, value}) => `${name}: ${value}`}
                                onClick={(data) => handleChartClick('firma', data.name)}
                            >
                                {advancedStats.firmStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60 + 180}, 65%, 55%)`} className="cursor-pointer hover:opacity-80" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className={sectionStyle}>
                    <h3 className={titleStyle}>⚡ Öncelik Dağılımı (Aktif)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={Object.entries(activeProcesses.reduce((acc, p) => ({ ...acc, [p.oncelikDuzeyi]: (acc[p.oncelikDuzeyi] || 0) + 1 }), {})).map(([name, value]) => ({ name, value }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({name, value}) => `${name}: ${value}`}
                                onClick={(data) => handleChartClick('oncelik', data.name)}
                            >
                                {Object.keys(PRIORITY_COLORS).map((key, index) => (
                                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[key]} className="cursor-pointer hover:opacity-80" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alt Detay Panelleri */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>⚠️ Geciken Süreçler ({advancedStats.overdueProcesses})</h3>
                    <div className="max-h-80 overflow-y-auto">
                        {advancedStats.overdueList.length > 0 ? (
                            <div className="space-y-2">
                                {advancedStats.overdueList.map(p => (
                                    <div 
                                        key={p.id}
                                        className="flex justify-between items-center border-b border-red-200 dark:border-red-900/50 py-3 text-xs cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 px-2 rounded transition-smooth"
                                        onClick={() => handleChartClick('processId', p.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg">⚠️</span>
                                            <div>
                                                <p className="font-semibold text-red-700 dark:text-red-400">{p.baslik}</p>
                                                <p className="text-slate-500 dark:text-slate-400">#{p.id} - {p.firma}</p>
                                                <p className="text-slate-500 dark:text-slate-400">Sorumlu: {p.sorumlular?.join(', ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-red-500 font-medium block">{p.sonrakiKontrolTarihi}</span>
                                            <span className="text-xs text-red-400">
                                                {Math.floor((new Date() - new Date(p.sonrakiKontrolTarihi)) / (1000 * 60 * 60 * 24))} gün gecikme
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <div className="text-4xl mb-2">✅</div>
                                <p>Gecikmiş süreç bulunmuyor!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={sectionStyle}>
                    <h3 className={titleStyle}>🔜 Bu Hafta Kontrol Edilecekler ({advancedStats.upcomingProcesses})</h3>
                    <div className="max-h-80 overflow-y-auto">
                        {advancedStats.upcomingList.length > 0 ? (
                            <div className="space-y-2">
                                {advancedStats.upcomingList.map(p => (
                                    <div 
                                        key={p.id}
                                        className="flex justify-between items-center border-b border-blue-200 dark:border-blue-900/50 py-3 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 rounded transition-smooth"
                                        onClick={() => handleChartClick('processId', p.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg">⏰</span>
                                            <div>
                                                <p className="font-semibold text-blue-700 dark:text-blue-400">{p.baslik}</p>
                                                <p className="text-slate-500 dark:text-slate-400">#{p.id} - {p.firma}</p>
                                                <p className="text-slate-500 dark:text-slate-400">Sorumlu: {p.sorumlular?.join(', ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-blue-500 font-medium block">{p.sonrakiKontrolTarihi}</span>
                                            <span className="text-xs text-blue-400">
                                                {Math.floor((new Date(p.sonrakiKontrolTarihi) - new Date()) / (1000 * 60 * 60 * 24))} gün kaldı
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <div className="text-4xl mb-2">📅</div>
                                <p>Bu hafta kontrol edilecek süreç yok</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;