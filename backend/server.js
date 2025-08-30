// .env dosyasındaki değişkenleri yüklemek için
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { connectDB, getMsgDb } = require('./src/config/database'); // Veritabanı fonksiyonlarımızı import ediyoruz

// Rota (route) dosyalarını import ediyoruz
const authRoutes = require('./src/routes/auth');
const processRoutes = require('./src/routes/processes');
const userRoutes = require('./src/routes/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

// Port numarasını .env dosyasından al, yoksa 3001 kullan
const PORT = process.env.PORT || 3001;

// Gerekli middleware'ler
app.use(cors());
app.use(express.json());

// Socket.io'yu tüm isteklere (request) ekliyoruz ki controller'lar içinde kullanılabilsin
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Ana API rotalarını tanımlıyoruz
app.use('/api/auth', authRoutes); // /api/auth ile başlayan tüm istekler authRoutes'a gitsin
app.use('/api/processes', processRoutes); // /api/processes ile başlayanlar processRoutes'a gitsin
app.use('/api/users', userRoutes);

// Socket.io bağlantı mantığı
io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);
    
    // Kullanıcı ayrıldığında
    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
    });

    // Buraya daha sonra online kullanıcılar ve mesajlaşma gibi özellikler eklenecek
});

// Sunucuyu başlatan ana fonksiyon
const startServer = async () => {
    try {
        // Önce veritabanı bağlantısının kurulmasını bekle
        await connectDB();
        // Bağlantı başarılı olduktan sonra sunucuyu dinlemeye başla
        server.listen(PORT, () => {
            console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
        });
    } catch (error) {
        console.error("Sunucu başlatılamadı:", error);
        process.exit(1);
    }
};

// Sunucuyu başlat
startServer();

