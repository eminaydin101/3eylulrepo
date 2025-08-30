import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = ({ processes, users, logs, handleGraphClick }) => {
    const chartTextStyle = { fontSize: '12px', fill: '#64748b' };
    const sectionStyle = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700";
    const titleStyle = "text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center";

    const activeProcesses = useMemo(() => processes.filter(p => p.durum !== 'Tamamlandı'), [processes]);
    const completedProcesses = useMemo(() => processes.filter(p => p.durum === 'Tamamlandı'), [processes]);

    const completedThisWeek = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0, 0, 0, 0);
        return completedProcesses.filter(p => p.tamamlanmaTarihi && new Date(p.tamamlanmaTarihi) >= startOfWeek).length;
    }, [completedProcesses]);

    const overdueProcesses = useMemo(() => activeProcesses.filter(p => p.sonrakiKontrolTarihi && new Date(p.sonrakiKontrolTarihi) < new Date()), [activeProcesses]);

    const userWorkload = useMemo(() => users.map(user => ({ name: user.fullName, "Aktif Süreç": activeProcesses.filter(p => p.sorumlular?.includes(user.fullName)).length, })).filter(u => u["Aktif Süreç"] > 0), [users, activeProcesses]);
    const userPerformance = useMemo(() => users.map(user => ({ name: user.fullName, "Tamamlanan Süreç": completedProcesses.filter(p => p.sorumlular?.includes(user.fullName)).length, })).filter(u => u["Tamamlanan Süreç"] > 0), [users, completedProcesses]);

    const priorityData = useMemo(() => Object.entries(activeProcesses.reduce((acc, p) => ({ ...acc, [p.oncelikDuzeyi]: (acc[p.oncelikDuzeyi] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [activeProcesses]);
    const statusData = useMemo(() => Object.entries(activeProcesses.reduce((acc, p) => ({ ...acc, [p.durum]: (acc[p.durum] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [activeProcesses]);
    const categoryData = useMemo(() => Object.entries(activeProcesses.reduce((acc, p) => ({ ...acc, [p.kategori]: (acc[p.kategori] || 0) + 1 }), {})).map(([name, value]) => ({ name, value })), [activeProcesses]);

    const PRIORITY_COLORS = { 'Yüksek': '#EF4444', 'Orta': '#F59E0B', 'Normal': '#3B82F6' };
    const STATUS_COLORS = { 'Aktif': '#3B82F6', 'İşlemde': '#F59E0B' };

    const SummaryCard = ({ title, value, color = 'dark:text-slate-200 text-slate-800' }) => ( <div className="bg-white dark:bg-slate-800 dark:border-slate-700 p-5 rounded-xl shadow-md border border-slate-200 text-center"> <h4 className="text-lg font-semibold text-slate-500 dark:text-slate-400">{title}</h4> <p className={`text-4xl font-bold ${color}`}>{value}</p> </div> );
    const ReportChart = ({ title, data, dataKey, chart, onClickHandler }) => ( <div className={sectionStyle}> <h3 className={titleStyle}>{title}</h3> <ResponsiveContainer width="100%" height={300}> {chart === 'bar' ? ( <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={onClickHandler}> <XAxis dataKey="name" stroke="#64748b" tick={chartTextStyle} /> <YAxis stroke="#64748b" tick={chartTextStyle}/> <Tooltip wrapperClassName="!bg-white !dark:!bg-slate-700 !border-slate-300 !dark:!border-slate-600 !rounded-lg !shadow-lg" /> <Bar dataKey={dataKey} fill={dataKey === 'Aktif Süreç' ? '#3b82f6' : '#22c55e'} radius={[4, 4, 0, 0]} className="cursor-pointer" /> </BarChart> ) : ( <PieChart> <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{fill: '#fff'}}> {data.map((entry, index) => ( <Cell key={`cell-${index}`} fill={dataKey === 'Öncelik' ? PRIORITY_COLORS[entry.name] : STATUS_COLORS[entry.name] || '#8b5cf6'} className="cursor-pointer" onClick={() => onClickHandler(entry.name)} /> ))} </Pie> <Tooltip wrapperClassName="!bg-white !dark:!bg-slate-700 !border-slate-300 !dark:!border-slate-600 !rounded-lg !shadow-lg" /> <Legend /> </PieChart> )} </ResponsiveContainer> </div> );
    const LogItem = ({ log }) => ( <li className="border-b border-slate-200 dark:border-slate-700 py-2 text-xs"> <p className="text-slate-700 dark:text-slate-300"> <span className="font-semibold text-slate-900 dark:text-slate-100">{log.userName}</span>, <button className="text-blue-600 hover:underline">#{log.processId}</button> numaralı süreçte <span className="font-medium">'{log.field}'</span> alanını güncelledi. </p> <p className="text-right text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</p> </li> );
    const OverdueItem = ({ process }) => ( <li className="flex justify-between items-center border-b border-red-200 dark:border-red-900/50 py-2 text-xs"> <div> <p className="font-semibold text-red-700">{process.baslik}</p> <p className="text-slate-500 dark:text-slate-400">Sorumlu: {process.sorumlular.join(', ')}</p> </div> <span className="font-mono text-red-500">{process.sonrakiKontrolTarihi}</span> </li> );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Aktif Süreçler" value={activeProcesses.length} />
                <SummaryCard title="Kontrol Tarihi Geçen" value={overdueProcesses.length} color={overdueProcesses.length > 0 ? 'text-red-500' : 'dark:text-slate-200 text-slate-800'} />
                <SummaryCard title="Bu Hafta Tamamlanan" value={completedThisWeek} />
                <SummaryCard title="Toplam Süreç" value={processes.length} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <ReportChart title="Kullanıcı İş Yükü (Aktif)" data={userWorkload} dataKey="Aktif Süreç" chart="bar" onClickHandler={(e) => e && handleGraphClick({sorumlular: e.activeLabel})} />
                <ReportChart title="Kullanıcı Performansı (Tamamlanan)" data={userPerformance} dataKey="Tamamlanan Süreç" chart="bar" />
                <ReportChart title="Önceliğe Göre Dağılım" data={priorityData} dataKey="Öncelik" chart="pie" onClickHandler={(name) => handleGraphClick({oncelikDuzeyi: name})} />
                <ReportChart title="Duruma Göre Dağılım" data={statusData} dataKey="Durum" chart="pie" onClickHandler={(name) => handleGraphClick({durum: name})}/>
                <ReportChart title="Kategoriye Göre Dağılım" data={categoryData} dataKey="Kategori" chart="pie" onClickHandler={(name) => handleGraphClick({kategori: name})}/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>Kontrol Tarihi Geçen Süreçler ({overdueProcesses.length})</h3>
                    <ul className="max-h-80 overflow-y-auto pr-2"> {overdueProcesses.length > 0 ? overdueProcesses.map(p => <OverdueItem key={p.id} process={p} />) : <p className="text-center text-slate-500 dark:text-slate-400">Gecikmiş süreç bulunmuyor.</p>} </ul>
                </div>
                <div className={sectionStyle}>
                    <h3 className={titleStyle}>Son Aktiviteler</h3>
                    <ul className="max-h-80 overflow-y-auto pr-2"> {(logs || []).map(log => <LogItem key={log.id} log={log} />)} </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;