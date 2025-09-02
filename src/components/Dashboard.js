import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = ({ processes, users, logs, onFilterApply }) => {
    const chartTextStyle = { fontSize: '12px', fill: '#64748b' };
    const sectionStyle = "card-modern p-6";
    const titleStyle = "text-xl font-semibold heading-modern mb-4 text-center";

    const activeProcesses = useMemo(() => processes.filter(p => p.durum !== 'Tamamlandı'), [processes]);
    const completedProcesses = useMemo(() => processes.filter(p => p.durum === 'Tamamlandı'), [processes]);

    const completedThisWeek = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0, 0, 0, 0);
        return completedProcesses.filter(p => p.tamamlanmaTarihi && new Date(p.tamamlanmaTarihi) >= startOfWeek).length;
    }, [completedProcesses]);

    const overdueProcesses = useMemo(() => activeProcesses.filter(p => p.sonrakiKontrolTarihi && new Date(p.sonrakiKontrolTarihi) < new Date()), [activeProcesses]);

    const userWorkload = useMemo(() => users.map(user => ({ 
        name: user.fullName.split(' ')[0], // Sadece ilk isim
        "Aktif Süreç": activeProcesses.filter(p => p.sorumlular?.includes(user.fullName)).length,
        userId: user.id
    })).filter(u => u["Aktif Süreç"] > 0).slice(0, 8), [users, activeProcesses]);

    const userPerformance = useMemo(() => users.map(user => ({ 
        name: user.fullName.split(' ')[0], // Sadece ilk isim
        "Tamamlanan Süreç": completedProcesses.filter(p => p.sorumlular?.includes(user.fullName)).length,
        userId: user.id
    })).filter(u => u["Tamamlanan Süreç"] > 0).slice(0, 8), [users, completedProcesses]);

    const priorityData = useMemo(() => Object.entries(activeProcesses.reduce((acc, p) => ({ ...acc, [p.oncelikDuzeyi]: (acc[p.oncelikDuzeyi] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [activeProcesses]);
    
    // TÜM SÜREÇLER İÇİN DURUM DAĞILIMI (Aktif + Tamamlanan)
    const statusData = useMemo(() => Object.entries(processes.reduce((acc, p) => ({ ...acc, [p.durum]: (acc[p.durum] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [processes]);
    
    const categoryData = useMemo(() => Object.entries(processes.reduce((acc, p) => ({ ...acc, [p.kategori]: (acc[p.kategori] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [processes]);
    const firmData = useMemo(() => Object.entries(processes.reduce((acc, p) => ({ ...acc, [p.firma]: (acc[p.firma] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [processes]);

    const PRIORITY_COLORS = { 'Yüksek': '#EF4444', 'Orta': '#F59E0B', 'Normal': '#3B82F6' };
    const STATUS_COLORS = { 'Aktif': '#3B82F6', 'İşlemde': '#F59E0B', 'Tamamlandı': '#10B981' };

    // Grafik tıklama handler'ları
    const handleChartClick = (filterType, filterValue) => {
        if (onFilterApply) {
            onFilterApply(filterType, filterValue);
        }
    };

    const handleBarChartClick = (data, index) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const clickedData = data.activePayload[0].payload;
            handleChartClick('sorumlu', clickedData.name);
        }
    };

    const handlePieChartClick = (data, filterType) => {
        if (data && data.name) {
            handleChartClick(filterType, data.name);
        }
    };

    const SummaryCard = ({ title, value, color = 'text-slate-800 dark:text-slate-200', onClick, filterType, filterValue, icon, gradient = false }) => ( 
        <div 
            className={`card-modern p-6 text-center hover-lift ${onClick ? 'cursor-pointer' : ''} ${gradient ? 'gradient-primary text-white' : ''}`}
            onClick={() => onClick && handleChartClick(filterType, filterValue)}
        > 
            <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                    <h4 className={`text-lg font-semibold ${gradient ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{title}</h4>
                    <p className={`text-4xl font-bold ${gradient ? 'text-white' : color}`}>{value}</p>
                </div>
                <div className={`text-4xl ${gradient ? 'text-white/60' : 'text-slate-300 dark:text-slate-600'}`}>
                    {icon}
                </div>
            </div>
        </div> 
    );

    const ReportChart = ({ title, data, dataKey, chart, filterType, showClickHint = true }) => ( 
        <div className={sectionStyle}> 
            <h3 className={titleStyle}>{title}</h3> 
            {showClickHint && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">📊 Filtrelemek için tıklayın</p>
            )}
            <ResponsiveContainer width="100%" height={300}> 
                {chart === 'bar' ? ( 
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarChartClick}> 
                        <XAxis dataKey="name" stroke="#64748b" tick={chartTextStyle} /> 
                        <YAxis stroke="#64748b" tick={chartTextStyle}/> 
                        <Tooltip 
                            wrapperClassName="!bg-white/95 dark:!bg-slate-700/95 !border-slate-300 dark:!border-slate-600 !rounded-xl !shadow-modern" 
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        /> 
                        <Bar 
                            dataKey={dataKey} 
                            fill={dataKey === 'Aktif Süreç' ? '#3b82f6' : '#10b981'} 
                            radius={[8, 8, 0, 0]} 
                            className="cursor-pointer hover:opacity-80 transition-opacity" 
                        /> 
                    </BarChart> 
                ) : ( 
                    <PieChart> 
                        <Pie 
                            data={data} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100} 
                            label={({name, value}) => `${name}: ${value}`}
                            onClick={(data) => handlePieChartClick(data, filterType)}
                        > 
                            {data.map((entry, index) => ( 
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        filterType === 'oncelik' ? PRIORITY_COLORS[entry.name] : 
                                        filterType === 'durum' ? STATUS_COLORS[entry.name] : 
                                        `hsl(${index * 45}, 70%, 50%)`
                                    } 
                                    className="cursor-pointer hover:opacity-80 stroke-white stroke-2 transition-opacity" 
                                /> 
                            ))} 
                        </Pie> 
                        <Tooltip 
                            wrapperClassName="!bg-white/95 dark:!bg-slate-700/95 !border-slate-300 dark:!border-slate-600 !rounded-xl !shadow-modern" 
                        /> 
                        <Legend /> 
                    </PieChart> 
                )} 
            </ResponsiveContainer> 
        </div> 
    );

    const LogItem = ({ log }) => ( 
        <li className="border-b border-slate-200 dark:border-slate-700 py-3 text-xs transition-smooth hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded"> 
            <div className="flex items-start gap-3">
                <span className="text-lg">📝</span>
                <div className="flex-1">
                    <p className="text-slate-700 dark:text-slate-300"> 
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{log.userName}</span>, 
                        <button 
                            className="text-blue-600 hover:underline mx-1 font-medium"
                            onClick={() => handleChartClick('processId', log.processId)}
                        >
                            #{log.processId}
                        </button> 
                        numaralı süreçte <span className="font-medium">'{log.field}'</span> alanını güncelledi. 
                    </p> 
                    <p className="text-right text-slate-400 text-[10px] mt-1">
                        {new Date(log.timestamp).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                    </p>
                </div>
            </div>
        </li> 
    );

    const OverdueItem = ({ process }) => ( 
        <li 
            className="flex justify-between items-center border-b border-red-200 dark:border-red-900/50 py-3 text-xs cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 px-2 rounded transition-smooth"
            onClick={() => handleChartClick('processId', process.id)}
        > 
            <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">{process.baslik}</p> 
                    <p className="text-slate-500 dark:text-slate-400">Sorumlu: {process.sorumlular.join(', ')}</p> 
                </div>
            </div>
            <span className="font-mono text-red-500 font-medium">{process.sonrakiKontrolTarihi}</span> 
        </li> 
    );

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    title="Aktif Süreçler" 
                    value={activeProcesses.length} 
                    onClick={true}
                    filterType="durum"
                    filterValue="Aktif"
                    icon="🔄"
                    gradient={true}
                />
                <SummaryCard 
                    title="Kontrol Tarihi Geçen" 
                    value={overdueProcesses.length} 
                    color={overdueProcesses.length > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'} 
                    onClick={true}
                    filterType="overdue"
                    filterValue="true"
                    icon="⚠️"
                />
                <SummaryCard 
                    title="Bu Hafta Tamamlanan" 
                    value={completedThisWeek} 
                    onClick={true}
                    filterType="completed_this_week"
                    filterValue="true"
                    icon="✅"
                    color="text-green-600"
                />
                <SummaryCard 
                    title="Toplam Süreç" 
                    value={processes.length} 
                    icon="📊"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <ReportChart 
                    title="Kullanıcı İş Yükü (Aktif)" 
                    data={userWorkload} 
                    dataKey="Aktif Süreç" 
                    chart="bar" 
                    filterType="sorumlu"
                />
                <ReportChart 
                    title="Kullanıcı Performansı (Tamamlanan)" 
                    data={userPerformance} 
                    dataKey="Tamamlanan Süreç" 
                    chart="bar" 
                    filterType="sorumlu"
                />
                <ReportChart 
                    title="Önceliğe Göre Dağılım (Aktif)" 
                    data={priorityData} 
                    chart="pie" 
                    filterType="oncelik"
                />
                <ReportChart 
                    title="Duruma Göre Dağılım (Tümü)" 
                    data={statusData} 
                    chart="pie" 
                    filterType="durum"
                />
                <ReportChart 
                    title="Kategoriye Göre Dağılım (Tümü)" 
                    data={categoryData} 
                    chart="pie" 
                    filterType="kategori"
                />
                <ReportChart 
                    title="Firmaya Göre Dağılım (Tümü)" 
                    data={firmData} 
                    chart="pie" 
                    filterType="firma"
                />
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>⚠️ Kontrol Tarihi Geçen Süreçler ({overdueProcesses.length})</h3>
                    <div className="max-h-80 overflow-y-auto"> 
                        {overdueProcesses.length > 0 ? (
                            <ul className="space-y-2">
                                {overdueProcesses.map(p => <OverdueItem key={p.id} process={p} />)}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <div className="text-4xl mb-2">✅</div>
                                <p>Gecikmiş süreç bulunmuyor!</p>
                            </div>
                        )} 
                    </div>
                </div>
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>📝 Son Aktiviteler</h3>
                    <div className="max-h-80 overflow-y-auto"> 
                        {(logs || []).length > 0 ? (
                            <ul className="space-y-2">
                                {(logs || []).slice(0, 10).map(log => <LogItem key={log.id} log={log} />)}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <div className="text-4xl mb-2">📝</div>
                                <p>Henüz aktivite bulunmuyor</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;