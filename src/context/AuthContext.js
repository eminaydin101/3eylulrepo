import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSession = localStorage.getItem('session');
            if (storedSession) {
                const parsedSession = JSON.parse(storedSession);
                // Token ve user bilgisi varsa oturumu geçerli say
                if (parsedSession && parsedSession.token && parsedSession.user) {
                    setSession(parsedSession);
                } else {
                    localStorage.removeItem('session'); // Bozuk veriyi temizle
                }
            }
        } catch (error) {
            console.error("Oturum verisi okunurken hata:", error);
            localStorage.removeItem('session');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.login({ email, password });
            const { user, token } = response.data;
            const newSession = { user, token };
            localStorage.setItem('session', JSON.stringify(newSession));
            setSession(newSession);
            return newSession;
        } catch (error) {
            logout();
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);
            const { user, token } = response.data;
            const newSession = { user, token };
            localStorage.setItem('session', JSON.stringify(newSession));
            setSession(newSession);
            return newSession;
        } catch (error) {
            logout();
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('session');
        setSession(null);
    };

    const value = { user: session?.user, token: session?.token, loading, login, logout, register };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};