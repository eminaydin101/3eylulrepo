import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Uygulama ilk açıldığında, localStorage'ı kontrol et
    useEffect(() => {
        try {
            const storedSession = localStorage.getItem('session');
            if (storedSession) {
                // Kayıtlı oturum varsa, kullanıcı bilgisini state'e ata
                setUser(JSON.parse(storedSession).user);
            }
        } catch (error) {
            console.error("Oturum verisi okunurken hata:", error);
            localStorage.removeItem('session'); // Bozuk veriyi temizle
        } finally {
            setLoading(false); // Kontrol bitti, yükleme durumunu false yap
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.login({ email, password });
            const { user, token } = response.data;

            // Oturum bilgilerini (user ve token) localStorage'a kaydet
            localStorage.setItem('session', JSON.stringify({ user, token }));
            // React state'ini sadece kullanıcı bilgisiyle güncelle
            setUser(user);
            return response.data;
        } catch (error) {
            console.error("Giriş başarısız:", error);
            throw error; // Hatanın Login sayfasında yakalanması için tekrar fırlat
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);
            const { user, token } = response.data;

            // Kayıt sonrası otomatik giriş yap
            localStorage.setItem('session', JSON.stringify({ user, token }));
            setUser(user);
            return response.data;
        } catch (error) {
            console.error("Kayıt başarısız:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('session');
        setUser(null);
    };

    const value = { user, loading, login, logout, register };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};