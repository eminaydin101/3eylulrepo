import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client'; // socket.io-client'ı buraya taşıyoruz

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

    // Veri çekme fonksiyonu
    const fetchData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        };
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
            // Sadece bir kere socket bağlantısı kur
            const newSocket = io(SOCKET_URL);
            setSocket(newSocket);

            newSocket.emit('user_online', user);

            newSocket.on('update_online_users', (onlineUsers) => {
                setData(prev => ({ ...prev, onlineUsers }));
            });

            newSocket.on('receive_message', (newMessage) => {
                setData(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
            });

            newSocket.on('data_changed', fetchData);

            // Component unmount olduğunda bağlantıyı kes
            return () => newSocket.disconnect();
        }
    }, [user, fetchData]); // Bağımlılıklardan socket'i çıkardık

    // İlk veri yüklemesi
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            // Kullanıcı çıkış yaparsa verileri ve yükleme durumunu sıfırla
            setData({ processes: [], users: [], firmalar: {}, kategoriler: {}, logs: [], messages: [], onlineUsers: [] });
            setLoading(false);
        }
    }, [user, fetchData]);

    // ... diğer fonksiyonlar (addProcess, addUser vs.)

    const value = { ...data, socket, loading, fetchData, /* ...diğer fonksiyonlar */ };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};