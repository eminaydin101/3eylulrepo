import React, { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';

const KanbanCard = ({ process, onEdit, onStatusChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Yüksek': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            case 'Orta': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
        }
    };

    const isOverdue = process.sonrakiKontrolTarihi && new Date(process.sonrakiKontrolTarihi) < new Date();

    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(process));
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onEdit(process)}
            className={`
                bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border-l-4 cursor-pointer
                hover:shadow-md transition-all duration-200 mb-3
                ${getPriorityColor(process.oncelikDuzeyi)}
                ${isDragging ? 'opacity-50 transform rotate-2' : ''}
                ${isOverdue ? 'ring-2 ring-red-400' : ''}
            `}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">
                    {process.baslik}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    #{process.id}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{process.firma}</span>
                    <span className={`px-2 py-1 rounded-full font-medium ${
                        process.oncelikDuzeyi === 'Yüksek' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        process.oncelikDuzeyi === 'Orta' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                        {process.oncelikDuzeyi}
                    </span>
                </div>

                {process.mevcutDurum && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {process.mevcutDurum.substring(0, 100)}...
                    </p>
                )}

                {process.sonrakiKontrolTarihi && (
                    <div className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        <span>📅</span>
                        <span>{process.sonrakiKontrolTarihi}</span>
                        {isOverdue && <span className="text-red-500">⚠️</span>}
                    </div>
                )}

                {process.sorumlular && process.sorumlular.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                        {process.sorumlular.slice(0, 2).map((sorumlu, index) => (
                            <span key={index} className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                                {sorumlu.split(' ').map(n => n[0]).join('')}
                            </span>
                        ))}
                        {process.sorumlular.length > 2 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                +{process.sorumlular.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, processes, status, onEdit, onStatusChange, color }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        try {
            const processData = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (processData.durum !== status) {
                onStatusChange(processData.id, status);
            }
        } catch (error) {
            console.error('Drag drop error:', error);
        }
    };

    return (
        <div className="flex-1 min-w-[300px]">
            <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 h-full ${isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                {/* Column Header */}
                <div className={`p-4 border-b border-slate-200 dark:border-slate-700 ${color}`}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            {title}
                        </h3>
                        <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full text-sm font-medium">
                            {processes.length}
                        </span>
                    </div>
                </div>

                {/* Cards Container */}
                <div 
                    className="p-4 min-h-[500px]"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {processes.length > 0 ? (
                        processes.map(process => (
                            <KanbanCard
                                key={process.id}
                                process={process}
                                onEdit={onEdit}
                                onStatusChange={onStatusChange}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <div className="text-3xl mb-2">📋</div>
                            <p>Bu sütunda süreç bulunmuyor</p>
                        </div>
                    )}
                    
                    {isDragOver && (
                        <div className="border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center text-blue-600 dark:text-blue-400">
                            <p>Buraya bırakın</p>
                        </div>
                    )}
                </div>
                </div>
       </div>
   );
};

const KanbanBoard = ({ processes, onEdit, onStatusChange }) => {
   const { success } = useToast();
   const [searchTerm, setSearchTerm] = useState('');

   const filteredProcesses = useMemo(() => {
       if (!searchTerm) return processes;
       return processes.filter(process => 
           process.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
           process.firma.toLowerCase().includes(searchTerm.toLowerCase()) ||
           process.kategori.toLowerCase().includes(searchTerm.toLowerCase())
       );
   }, [processes, searchTerm]);

   const columns = useMemo(() => {
       const aktif = filteredProcesses.filter(p => p.durum === 'Aktif');
       const islemde = filteredProcesses.filter(p => p.durum === 'İşlemde');
       const tamamlandi = filteredProcesses.filter(p => p.durum === 'Tamamlandı');
       
       return { aktif, islemde, tamamlandi };
   }, [filteredProcesses]);

   const handleStatusChange = async (processId, newStatus) => {
       try {
           await onStatusChange(processId, newStatus);
           success(`Süreç durumu "${newStatus}" olarak güncellendi`);
       } catch (error) {
           console.error('Status change error:', error);
       }
   };

   return (
       <div className="space-y-6">
           {/* Search Bar */}
           <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
               <div className="max-w-md">
                   <input
                       type="text"
                       placeholder="Süreç ara..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                   />
               </div>
           </div>

           {/* Kanban Board */}
           <div className="flex gap-6 overflow-x-auto pb-4">
               <KanbanColumn
                   title="Aktif"
                   processes={columns.aktif}
                   status="Aktif"
                   onEdit={onEdit}
                   onStatusChange={handleStatusChange}
                   color="bg-blue-100 dark:bg-blue-900/30"
               />
               
               <KanbanColumn
                   title="İşlemde"
                   processes={columns.islemde}
                   status="İşlemde"
                   onEdit={onEdit}
                   onStatusChange={handleStatusChange}
                   color="bg-yellow-100 dark:bg-yellow-900/30"
               />
               
               <KanbanColumn
                   title="Tamamlandı"
                   processes={columns.tamamlandi}
                   status="Tamamlandı"
                   onEdit={onEdit}
                   onStatusChange={handleStatusChange}
                   color="bg-green-100 dark:bg-green-900/30"
               />
           </div>

           {/* Instructions */}
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
               <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                   <span>💡</span>
                   <span>Süreçleri sürükleyip bırakarak durumlarını değiştirebilirsiniz. Düzenlemek için karta tıklayın.</span>
               </div>
           </div>
       </div>
   );
};

export default KanbanBoard;