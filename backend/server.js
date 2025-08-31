require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { connectDB, getDb, getMsgDb } = require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const processRoutes = require('./src/routes/processes');
const userRoutes = require('./src/routes/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/users', userRoutes);

// --- YENİ VE GELİŞTİRİLMİŞ SOCKET MANTIĞI ---
let onlineUsers = {}; // Online kullanıcıları { userId: { user, socketId } } formatında tutacağız

io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);

    // Kullanıcı giriş yaptığında online listesine ekle
    socket.on('user_online', (user) => {
        if (user && user.id) {
            onlineUsers[user.id] = { ...user, socketId: socket.id };
            // Tüm client'lara güncel online listesini gönder
            io.emit('update_online_users', Object.values(onlineUsers));
        }
    });

    // Bir kullanıcı mesaj gönderdiğinde
    socket.on('send_message', async (message) => {
        try {
            const msgDb = await getMsgDb();
            // Mesajı veritabanına kaydet
            const result = await msgDb.run(
                'INSERT INTO messages (senderId, recipientId, content, type) VALUES (?, ?, ?, ?)',
                message.senderId, message.recipientId, message.content, message.type || 'text'
            );
            // Kaydedilen mesajı ID ve timestamp ile birlikte geri al
            const newMessage = await msgDb.get('SELECT * FROM messages WHERE id = ?', result.lastID);

            // Alıcı online ise, mesajı ona gönder
            const recipientSocket = onlineUsers[message.recipientId];
            if (recipientSocket) {
                io.to(recipientSocket.socketId).emit('receive_message', newMessage);
            }

            // Mesajı gönderene de geri gönder ki kendi ekranında görsün
            socket.emit('receive_message', newMessage);

        } catch (error) {
            console.error("Mesaj kaydetme/gönderme hatası:", error);
        }
    });

    // Kullanıcı bağlantısı kesildiğinde
    socket.on('disconnect', () => {
        // Hangi kullanıcının ayrıldığını bul ve listeden çıkar
        const disconnectedUserKey = Object.keys(onlineUsers).find(key => onlineUsers[key].socketId === socket.id);
        if (disconnectedUserKey) {
            delete onlineUsers[disconnectedUserKey];
            io.emit('update_online_users', Object.values(onlineUsers));
            console.log(`Kullanıcı ayrıldı: ${disconnectedUserKey}`);
        }
    });
});

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
        });
    } catch (error) {
        console.error("Sunucu başlatılamadı:", error);
        process.exit(1);
    }
};

startServer();