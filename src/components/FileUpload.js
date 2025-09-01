import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import * as api from '../services/api';

const FileUpload = ({ processId, files, onFilesChange }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();
    const { success, error } = useToast();

    const handleFileSelect = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            await api.uploadFiles(processId, formData);
            success(`${selectedFiles.length} dosya başarıyla yüklendi`);
            
            // Dosya listesini yenile
            if (onFilesChange) {
                onFilesChange();
            }
            
            // Input'u temizle
            event.target.value = '';
        } catch (err) {
            error('Dosya yükleme hatası: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
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

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Dosyalar ({files?.length || 0})
                </h3>
                
                <div className="flex items-center gap-2">
                    {uploading && <LoadingSpinner size="sm" />}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        {uploading ? 'Yükleniyor...' : '+ Dosya Ekle'}
                    </button>
                </div>
            </div>

            {files && files.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                        {file.originalName}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(file.id, file.originalName)}
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    title="İndir"
                                >
                                    ⬇️
                                </button>
                                <button
                                    onClick={() => handleDelete(file.id, file.originalName)}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="text-4xl mb-2">📎</div>
                    <p>Henüz dosya eklenmemiş</p>
                    <p className="text-sm">Dosya eklemek için yukarıdaki butona tıklayın</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;