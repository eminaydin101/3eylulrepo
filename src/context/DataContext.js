import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [data, setData] = useState({
        processes: [],
        users: [],
        firmalar: {},
        kategoriler: {},
        logs: [],
        messages: [],
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.getInitialData();
            setData(response.data);
        } catch (error) {
            console.error("Uygulama verileri alınırken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    // --- SÜREÇ İŞLEMLERİ ---
    const addProcess = async (processData) => { /* ... mevcut kod ... */ };
    const updateProcess = async (id, processData) => { /* ... mevcut kod ... */ };
    const deleteProcess = async (id) => { /* ... mevcut kod ... */ };

    // --- YENİ KULLANICI İŞLEMLERİ ---
    const addUser = async (userData) => {
        try {
            await api.createUser(userData);
            // Backend socket.io ile 'data_changed' sinyali gönderdiği için
            // fetchData'yı burada tekrar çağırmamıza gerek yok, arayüz otomatik güncellenecek.
        } catch (error) {
            console.error("Kullanıcı eklenirken hata:", error);
            throw error; // Hatanın modal'da yakalanması için tekrar fırlat
        }
    };

    const editUser = async (id, userData) => {
        try {
            await api.updateUser(id, userData);
        } catch (error) {
            console.error("Kullanıcı güncellenirken hata:", error);
            throw error;
        }
    };

    const removeUser = async (id) => {
        try {
            await api.deleteUser(id);
        } catch (error) {
            console.error("Kullanıcı silinirken hata:", error);
            throw error;
        }
    };

    const value = {
        ...data,
        loading,
        fetchData,
        addProcess,
        updateProcess,
        deleteProcess,
        addUser,    // Yeni fonksiyonları context'e ekliyoruz
        editUser,   // Yeni fonksiyonları context'e ekliyoruz
        removeUser  // Yeni fonksiyonları context'e ekliyoruz
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};