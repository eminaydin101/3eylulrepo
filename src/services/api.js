import axios from 'axios';

// Backend sunucumuzun adresini burada tanımlıyoruz
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Otomatik olarak her isteğe JWT token'ı ekleyen mekanizma
// Kullanıcı giriş yaptıktan sonra token'ı local storage'dan alıp kullanacağız
apiClient.interceptors.request.use((config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
        // Token'ı direkt user nesnesinden değil, token'ın kendisinden almalıyız.
        const token = JSON.parse(userString).token; 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


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