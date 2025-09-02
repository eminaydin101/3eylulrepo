import axios from 'axios';

// Backend sunucumuzun adresini burada tanımlıyoruz
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Otomatik olarak her isteğe JWT token'ı ekleyen mekanizma
apiClient.interceptors.request.use((config) => {
    const sessionString = localStorage.getItem('session');
    if (sessionString) {
        try {
            const session = JSON.parse(sessionString);
            if (session && session.token) {
                config.headers.Authorization = `Bearer ${session.token}`;
            }
        } catch (error) {
            console.error('Token okuma hatası:', error);
            localStorage.removeItem('session');
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor - 401 hatalarında otomatik logout
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('session');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// --- Kimlik Doğrulama (Auth) Fonksiyonları ---
export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const register = (userData) => apiClient.post('/auth/register', userData);
export const forgotPassword = (data) => apiClient.post('/auth/forgot-password', data);
export const resetPassword = (data) => apiClient.post('/auth/reset-password', data);
export const verifyEmail = (data) => apiClient.post('/auth/verify-email', data);

// --- Veri (Data) Fonksiyonları ---
export const getInitialData = () => apiClient.get('/processes/initial-data');
export const createProcess = (processData) => apiClient.post('/processes', processData);
export const updateProcess = (id, processData) => apiClient.put(`/processes/${id}`, processData);
export const deleteProcess = (id) => apiClient.delete(`/processes/${id}`);

// --- Kullanıcı (Users) Fonksiyonları ---
export const createUser = (userData) => apiClient.post('/users', userData);
export const updateUser = (id, userData) => apiClient.put(`/users/${id}`, userData);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);

// --- Dosya (File) Fonksiyonları ---
export const uploadFiles = (processId, formData) => {
    return apiClient.post(`/files/upload/${processId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const getProcessFiles = (processId) => apiClient.get(`/files/${processId}`);
export const downloadFile = (fileId) => apiClient.get(`/files/download/${fileId}`, { responseType: 'blob' });
export const deleteFile = (fileId) => apiClient.delete(`/files/${fileId}`);

// --- Sistem (System) Fonksiyonları ---
export const getSystemSettings = () => apiClient.get('/system/settings');
export const updateSystemSettings = (formData) => {
    return apiClient.post('/system/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// --- Backup (Yedekleme) Fonksiyonları ---
export const getBackups = () => apiClient.get('/backup');
export const createDatabaseBackup = () => apiClient.post('/backup/database');
// YENİ: Backup import fonksiyonu
export const importBackup = (formData) => {
    return apiClient.post('/backup/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const cleanTempFiles = () => apiClient.post('/backup/clean-temp');
export const generateSystemReport = () => apiClient.post('/backup/system-report');
export const clearAllLogs = () => apiClient.post('/backup/clear-logs');
export const factoryReset = () => apiClient.post('/backup/factory-reset');
export const downloadBackup = (fileName) => {
    return apiClient.get(`/backup/download/${fileName}`, { 
        responseType: 'blob',
        headers: {
            'Accept': 'application/octet-stream'
        }
    });
};
export const deleteBackup = (fileName) => apiClient.delete(`/backup/${fileName}`);