import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const DataContext = createContext(null);
const SOCKET_URL = 'http://localhost:3001';

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [data, setData] = useState({
        processes: [], users: [], firmalar: {}, kategoriler: {}, 
        logs: [], messages: [], onlineUsers: []
    });
    const [loading, setLoading] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState({});

    // Veri çekme fonksiyonu
    const fetchData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await api.getInitialData();
            setData(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error("Uygulama verileri alınırken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Socket bağlantısını kurma ve olayları dinleme
    useEffect(() => {
        if (user) {
            const newSocket = io(SOCKET_URL);
            setSocket(newSocket);

            newSocket.emit('user_online', user);

            newSocket.on('update_online_users', (onlineUsers) => {
                setData(prev => ({ ...prev, onlineUsers }));
            });

            newSocket.on('receive_message', (newMessage) => {
                setData(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
                
                // Okunmamış mesaj sayısını güncelle
                if (newMessage.senderId !== user.id) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
                    }));
                }
            });

            newSocket.on('data_changed', fetchData);

            return () => newSocket.disconnect();
        }
    }, [user, fetchData]);

    // İlk veri yüklemesi
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setData({ processes: [], users: [], firmalar: {}, kategoriler: {}, logs: [], messages: [], onlineUsers: [] });
            setLoading(false);
        }
    }, [user, fetchData]);

    // ===== PROCESS İŞLEMLERİ =====
    const addProcess = useCallback(async (processData) => {
        try {
            await api.createProcess(processData);
            await fetchData(); // Verileri yenile
        } catch (error) {
            console.error("Süreç ekleme hatası:", error);
            throw error;
        }
    }, [fetchData]);

    const updateProcess = useCallback(async (id, processData) => {
        try {
            await api.updateProcess(id, processData);
            await fetchData(); // Verileri yenile
        } catch (error) {
            console.error("Süreç güncelleme hatası:", error);
            throw error;
        }
    }, [fetchData]);

    const deleteProcess = useCallback(async (id) => {
        try {
            await api.deleteProcess(id);
            await fetchData(); // Verileri yenile
        } catch (error) {
            console.error("Süreç silme hatası:", error);
            throw error;
        }
    }, [fetchData]);

    // ===== USER İŞLEMLERİ =====
    const addUser = useCallback(async (userData) => {
        try {
            await api.createUser(userData);
            await fetchData(); // Verileri yenile
        } catch (error) {
            console.error("Kullanıcı ekleme hatası:", error);
            throw error;
        }
    }, [fetchData]);

    const editUser = useCallback(async (id, userData) => {
        try {
            await api.updateUser(id, userData);
            await fetchData(); // Verileri yenile
        } catch (error) {
            console.error("Kullanıcı güncelleme hatası:", error);
            throw error;
        }
    }, [fetchData]);

    const removeUser = useCallback(async (id) => {
        try {
            await api.deleteUser(id);
            await fetchData(); // Verileri yenile
        } catch (error) {
            console.error("Kullanıcı silme hatası:", error);
            throw error;
        }
    }, [fetchData]);

    // Okunmamış mesaj sayısını sıfırla
    const markMessagesAsRead = useCallback((userId) => {
        setUnreadCounts(prev => ({
            ...prev,
            [userId]: 0
        }));
    }, []);

    const value = { 
        ...data, 
        socket, 
        loading, 
        unreadCounts,
        fetchData,
        addProcess,
        updateProcess,
        deleteProcess,
        addUser,
        editUser,
        removeUser,
        markMessagesAsRead
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};