const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

const dbFilePath = path.join(__dirname, '..', '..', 'database.sqlite');
const msgDbFilePath = path.join(__dirname, '..', '..', 'msgdatabase.sqlite');

let dbPromise;

// --- ÖRNEK VERİ OLUŞTURMA FONKSİYONLARI (Orijinal server.js'den alındı ve uyarlandı) ---
const getSampleUsers = async () => {
    const saltRounds = 10;
    const users = [
        { id: 1, fullName: 'Super Admin 1', email: 'superadmin1@test.com', role: 'SuperAdmin', status: 'Active', hint: 'ipucu' },
        { id: 2, fullName: 'Super Admin 2', email: 'superadmin2@test.com', role: 'SuperAdmin', status: 'Active', hint: 'ipucu' },
        { id: 3, fullName: 'Admin 1', email: 'admin1@test.com', role: 'Admin', status: 'Active', hint: 'ipucu' },
        { id: 4, fullName: 'Admin 2', email: 'admin2@test.com', role: 'Admin', status: 'Active', hint: 'ipucu' },
        { id: 5, fullName: 'Editor 1', email: 'editor1@test.com', role: 'Editor', status: 'Active', hint: 'ipucu' },
        { id: 6, fullName: 'Editor 2', email: 'editor2@test.com', role: 'Editor', status: 'Active', hint: 'ipucu' },
        { id: 7, fullName: 'Viewer 1', email: 'viewer1@test.com', role: 'Viewer', status: 'Active', hint: 'ipucu' },
        { id: 8, fullName: 'Viewer 2', email: 'viewer2@test.com', role: 'Viewer', status: 'Active', hint: 'ipucu' }
    ];
    const hashedPassword = await bcrypt.hash('123456', saltRounds);
    return users.map(u => ({ ...u, password: hashedPassword }));
};

const generateSampleProcesses = (users) => {
    const processes = [];
    const priorities = ['Normal', 'Orta', 'Yüksek'];
    const firms = { "Sera": ["Merkez", "Van", "Teknopark"], "Van": ["Bil", "İn", "Endüstri"], "Mik": ["Bos", "Ad", "Çarşı"], "Alfa": ["İstanbul", "Ankara"] };
    const categories = { "Yazılım": ["Web Geliştirme", "Mobil Geliştirme", "Veritabanı Yönetimi"], "Finans": ["Muhasebe", "Bütçe", "Denetim"], "BT": ["Altyapı", "Siber Güvenlik", "Donanım"], "Yönetim": ["İnsan Kaynakları", "Operasyon", "Pazarlama"] };

    for (let i = 1; i <= 55; i++) {
        const isCompleted = i % 5 === 0;
        const startDate = new Date(Date.now() - (Math.floor(Math.random() * 60) + 1) * 24 * 60 * 60 * 1000);
        const nextControlDate = new Date(Date.now() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000);

        const firmKeys = Object.keys(firms);
        const randomFirm = firmKeys[i % firmKeys.length];
        const randomLocation = firms[randomFirm][i % firms[randomFirm].length];

        const catKeys = Object.keys(categories);
        const randomCategory = catKeys[i % catKeys.length];
        const randomSubCategory = categories[randomCategory][i % categories[randomCategory].length];

        const assignedUserIds = users.slice(i % 4, (i % 4) + Math.floor(i / 10) + 1).map(u => u.id);

        processes.push({
            id: String(i).padStart(6, '0'),
            firma: randomFirm,
            konum: randomLocation,
            baslik: `Örnek Süreç #${i}`,
            surec: `Bu ${i}. otomatik olarak oluşturulmuş örnek süreçtir.`,
            mevcutDurum: isCompleted ? `Süreç başarıyla tamamlandı.` : `Süreç başlangıç aşamasında.`,
            baslangicTarihi: startDate.toISOString().slice(0, 10),
            sonrakiKontrolTarihi: isCompleted ? "" : nextControlDate.toISOString().slice(0, 10),
            tamamlanmaTarihi: isCompleted ? new Date(startDate.getTime() + (Math.floor(Math.random() * 30)) * 24*60*60*1000).toISOString().slice(0,10) : "",
            kategori: randomCategory,
            altKategori: randomSubCategory,
            sorumlular: assignedUserIds.length > 0 ? assignedUserIds : [users[0].id],
            oncelikDuzeyi: priorities[i % priorities.length],
            durum: isCompleted ? 'Tamamlandı' : (i % 3 === 0 ? 'İşlemde' : 'Aktif'),
        });
    }
    return processes;
};

const setupMainDbSchema = async (db) => {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, fullName TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT, role TEXT, status TEXT, hint TEXT);
        CREATE TABLE IF NOT EXISTS processes (id TEXT PRIMARY KEY, firma TEXT, konum TEXT, baslik TEXT, surec TEXT, mevcutDurum TEXT, baslangicTarihi TEXT, sonrakiKontrolTarihi TEXT, tamamlanmaTarihi TEXT, kategori TEXT, altKategori TEXT, oncelikDuzeyi TEXT, durum TEXT);
        CREATE TABLE IF NOT EXISTS process_assignments (processId TEXT, userId INTEGER, PRIMARY KEY (processId, userId), FOREIGN KEY (processId) REFERENCES processes(id) ON DELETE CASCADE, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, userName TEXT, processId TEXT, field TEXT, oldValue TEXT, newValue TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);

    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
        console.log('Veritabanı boş, örnek veriler ekleniyor...');
        const sampleUsers = await getSampleUsers();
        for (const user of sampleUsers) {
            await db.run('INSERT INTO users (id, fullName, email, password, role, status, hint) VALUES (?, ?, ?, ?, ?, ?, ?)', user.id, user.fullName, user.email, user.password, user.role, user.status, user.hint);
        }
        const sampleProcesses = generateSampleProcesses(sampleUsers);
        for (const process of sampleProcesses) {
            const { sorumlular, ...processData } = process;
            await db.run(`INSERT INTO processes (id, firma, konum, baslik, surec, mevcutDurum, baslangicTarihi, sonrakiKontrolTarihi, tamamlanmaTarihi, kategori, altKategori, oncelikDuzeyi, durum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, Object.values(processData));
            for (const userId of sorumlular) {
                await db.run('INSERT INTO process_assignments (processId, userId) VALUES (?, ?)', process.id, userId);
            }
        }
        console.log('Örnek veriler başarıyla eklendi.');
    }
};

const connectDB = () => {
    if (dbPromise) return dbPromise;
    dbPromise = (async () => {
        try {
            const db = await open({ filename: dbFilePath, driver: sqlite3.Database });
            console.log('Ana veritabanına bağlanıldı.');
            await setupMainDbSchema(db);

            const msgDb = await open({ filename: msgDbFilePath, driver: sqlite3.Database });
            console.log('Mesaj veritabanına bağlanıldı.');
            await msgDb.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, senderId INTEGER, recipientId INTEGER, content TEXT, type TEXT DEFAULT 'text', timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, read INTEGER DEFAULT 0);`);

            console.log("Veritabanları kullanıma hazır.");
            return { db, msgDb };
        } catch (error) {
            console.error("Veritabanı bağlantı hatası:", error);
            dbPromise = null; 
            process.exit(1);
        }
    })();
    return dbPromise;
};

const getDb = async () => {
    const { db } = await connectDB();
    return db;
};

const getMsgDb = async () => {
    const { msgDb } = await connectDB();
    return msgDb;
};

module.exports = { connectDB, getDb, getMsgDb };