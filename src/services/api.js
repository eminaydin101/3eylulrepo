import axios from 'axios';

// Backend sunucumuzun adresini burada tanımlıyoruz
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Otomatik olarak her isteğe JWT token'ı ekleyen mekanizma
// DÜZELTME: Token'ı session nesnesinden doğru şekilde alıyoruz
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

// --- Veri (Data) Fonksiyonları ---
export const getInitialData = () => apiClient.get('/processes/initial-data');
export const createProcess = (processData) => apiClient.post('/processes', processData);
export const updateProcess = (id, processData) => apiClient.put(`/processes/${id}`, processData);
export const deleteProcess = (id) => apiClient.delete(`/processes/${id}`);

// --- Kullanıcı (Users) Fonksiyonları ---
export const createUser = (userData) => apiClient.post('/users', userData);
export const updateUser = (id, userData) => apiClient.put(`/users/${id}`, userData);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);