import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const DataContext = createContext(null);

// Socket URL'ini environment'a göre ayarla
const getSocketUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return window.location.origin; // Production'da aynı domain
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const SOCKET_URL = getSocketUrl();

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
        } catch (err) {
            console.error("Uygulama verileri alınırken hata oluştu:", err);
            // Hata durumunda da loading'i false yap
            setData(prev => ({ ...prev, processes: [], users: [], firmalar: {}, kategoriler: {}, logs: [], messages: [], onlineUsers: [] }));
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Socket bağlantısını kurma ve olayları dinleme
    useEffect(() => {
        if (user) {
            let newSocket;
            try {
                newSocket = io(SOCKET_URL, {
                    timeout: 20000,
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000
                });
                setSocket(newSocket);

                newSocket.emit('user_online', user);

                newSocket.on('connect', () => {
                    console.log('Socket bağlantısı kuruldu');
                });

                newSocket.on('disconnect', () => {
                    console.log('Socket bağlantısı kesildi');
                });

                newSocket.on('connect_error', (error) => {
                    console.error('Socket bağlantı hatası:', error);
                });

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

                newSocket.on('data_changed', () => {
                    console.log('Veri değişikliği algılandı, yeniden yükleniyor...');
                    fetchData();
                });

                return () => {
                    if (newSocket) {
                        newSocket.disconnect();
                    }
                };
            } catch (error) {
                console.error('Socket başlatma hatası:', error);
                setSocket(null);
            }
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
        } catch (err) {
            console.error("Süreç ekleme hatası:", err);
            throw err;
        }
    }, [fetchData]);

    const updateProcess = useCallback(async (id, processData) => {
        try {
            await api.updateProcess(id, processData);
            await fetchData(); // Verileri yenile
        } catch (err) {
            console.error("Süreç güncelleme hatası:", err);
            throw err;
        }
    }, [fetchData]);

    const deleteProcess = useCallback(async (id) => {
        try {
            await api.deleteProcess(id);
            await fetchData(); // Verileri yenile
        } catch (err) {
            console.error("Süreç silme hatası:", err);
            throw err;
        }
    }, [fetchData]);

    // ===== USER İŞLEMLERİ =====
    const addUser = useCallback(async (userData) => {
        try {
            await api.createUser(userData);
            await fetchData(); // Verileri yenile
        } catch (err) {
            console.error("Kullanıcı ekleme hatası:", err);
            throw err;
        }
    }, [fetchData]);

    const editUser = useCallback(async (id, userData) => {
        try {
            await api.updateUser(id, userData);
            await fetchData(); // Verileri yenile
        } catch (err) {
            console.error("Kullanıcı güncelleme hatası:", err);
            throw err;
        }
    }, [fetchData]);

    const removeUser = useCallback(async (id) => {
        try {
            await api.deleteUser(id);
            await fetchData(); // Verileri yenile
        } catch (err) {
            console.error("Kullanıcı silme hatası:", err);
            throw err;
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
        setData  // Bu satırı ekleyin
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};