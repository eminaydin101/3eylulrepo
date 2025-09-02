import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import * as api from '../services/api';

const FileUpload = ({ processId, files, onFilesChange }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef();
    const { success, error } = useToast();

    const handleFileSelect = async (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        // Dosya boyutu kontrolü
        const oversizedFiles = Array.from(selectedFiles).filter(file => file.size > 50 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            error(`Bu dosyalar çok büyük: ${oversizedFiles.map(f => f.name).join(', ')}. Maksimum 50MB.`);
            return;
        }

        // Dosya tipi kontrolü
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip'];
        const invalidFiles = Array.from(selectedFiles).filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return !allowedTypes.includes(extension);
        });
        
        if (invalidFiles.length > 0) {
            error(`Bu dosya tipleri desteklenmiyor: ${invalidFiles.map(f => f.name).join(', ')}`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            Array.from(selectedFiles).forEach(file => {
                formData.append('files', file);
            });

            // Simulated progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            await api.uploadFiles(processId, formData);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            success(`${selectedFiles.length} dosya başarıyla yüklendi`);
            
            // Dosya listesini yenile
            if (onFilesChange) {
                onFilesChange();
            }
            
            // Input'u temizle
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setTimeout(() => {
                setUploadProgress(0);
            }, 1000);
            
        } catch (err) {
            error('Dosya yükleme hatası: ' + (err.response?.data?.message || err.message));
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (event) => {
        handleFileSelect(event.target.files);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        const droppedFiles = event.dataTransfer.files;
        handleFileSelect(droppedFiles);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragOver(false);
    };

    const handleDownload = async (fileId, originalName) => {
        try {
            const response = await api.downloadFile(fileId);
            
            // Blob oluştur ve indir
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            success('Dosya indiriliyor...');
        } catch (err) {
            error('Dosya indirme hatası');
        }
    };

    const handleDelete = async (fileId, originalName) => {
        if (!window.confirm(`"${originalName}" dosyasını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await api.deleteFile(fileId);
            success('Dosya silindi');
            
            if (onFilesChange) {
                onFilesChange();
            }
        } catch (err) {
            error('Dosya silme hatası');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimetype) => {
        if (mimetype?.includes('image')) return '🖼️';
        if (mimetype?.includes('pdf')) return '📄';
        if (mimetype?.includes('word')) return '📝';
        if (mimetype?.includes('excel') || mimetype?.includes('spreadsheet')) return '📊';
        if (mimetype?.includes('zip')) return '📦';
        return '📁';
    };

    const getFileColor = (mimetype) => {
        if (mimetype?.includes('image')) return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
        if (mimetype?.includes('pdf')) return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
        if (mimetype?.includes('word')) return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
        if (mimetype?.includes('excel') || mimetype?.includes('spreadsheet')) return 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/10';
        if (mimetype?.includes('zip')) return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10';
        return 'border-l-slate-500 bg-slate-50 dark:bg-slate-900/10';
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    📎 Dosyalar ({files?.length || 0})
                </h3>
                
                <div className="flex items-center gap-2">
                    {uploading && (
                        <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {uploadProgress}%
                            </span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleInputChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        {uploading ? 'Yükleniyor...' : '+ Dosya Ekle'}
                    </button>
                </div>
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
                <div className="mb-4">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Drag & Drop Area */}
            <div 
                className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center transition-colors ${
                    dragOver 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="text-4xl mb-2">📁</div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    {dragOver ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyip bırakın'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    veya yukarıdaki butona tıklayın
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Maksimum 50MB • JPG, PNG, PDF, DOC, XLS, TXT, ZIP
                </p>
            </div>

            {/* Files List */}
            {files && files.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {files.map(file => (
                        <div key={file.id} className={`flex items-center justify-between p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${getFileColor(file.mimetype)}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimetype)}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                        {file.originalName}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>•</span>
                                        <span>{new Date(file.uploadedAt).toLocaleDateString('tr-TR')}</span>
                                        {file.mimetype && (
                                            <>
                                                <span>•</span>
                                                <span className="uppercase text-xs font-medium">
                                                    {file.mimetype.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleDownload(file.id, file.originalName)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="İndir"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(file.id, file.originalName)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Sil"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="text-4xl mb-2">📎</div>
                    <p className="font-medium">Henüz dosya eklenmemiş</p>
                    <p className="text-sm">Dosya eklemek için yukarıdaki alanı kullanın</p>
                </div>
            )}

            {/* File Stats */}
            {files && files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                        <span>
                            Toplam {files.length} dosya
                        </span>
                        <span>
                            {formatFileSize(files.reduce((total, file) => total + (file.size || 0), 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;