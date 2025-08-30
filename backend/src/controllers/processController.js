const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid'); // Benzersiz log ID'leri için

// Tüm başlangıç verilerini getiren fonksiyon (ilişkisel)
exports.getInitialData = async (req, res) => {
    try {
        const db = await getDb();
        const processesRaw = await db.all('SELECT * FROM processes ORDER BY baslangicTarihi DESC');
        const users = await db.all('SELECT id, fullName, email, role, status FROM users');
        const assignments = await db.all('SELECT * FROM process_assignments');
        const logs = await db.all('SELECT * FROM logs ORDER BY timestamp DESC');

        // Her sürece sorumlu kullanıcıların tam isimlerini ekle
        const processes = processesRaw.map(p => {
            const respIds = assignments.filter(a => a.processId === p.id).map(a => a.userId);
            const sorumlular = respIds.map(id => users.find(u => u.id === id)?.fullName).filter(Boolean);
            return { ...p, sorumlular };
        });

        const firmalar = { "Sera": ["Merkez", "Van", "Teknopark"], "Van": ["Bil", "İn", "Endüstri"], "Mik": ["Bos", "Ad", "Çarşı"], "Alfa": ["İstanbul", "Ankara"] };
        const kategoriler = { "Yazılım": ["Web Geliştirme", "Mobil Geliştirme", "Veritabanı Yönetimi"], "Finans": ["Muhasebe", "Bütçe", "Denetim"], "BT": ["Altyapı", "Siber Güvenlik", "Donanım"], "Yönetim": ["İnsan Kaynakları", "Operasyon", "Pazarlama"] };

        res.status(200).json({ processes, users, firmalar, kategoriler, logs });
    } catch (error) {
        console.error("Başlangıç verileri alınırken hata:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

const createLogEntry = async (db, logData) => {
     await db.run(
        `INSERT INTO logs (userId, userName, processId, field, oldValue, newValue) VALUES (?, ?, ?, ?, ?, ?)`,
        logData.userId, logData.userName, logData.processId, logData.field, logData.oldValue, logData.newValue
    );
};

// Yeni süreç oluşturma
exports.createProcess = async (req, res) => {
    const { sorumlular, ...processData } = req.body;
    const newId = String(Date.now()).slice(-6); // Basit bir ID oluşturma
    processData.id = newId;

    try {
        const db = await getDb();
        const userMap = new Map((await db.all('SELECT id, fullName FROM users')).map(u => [u.fullName, u.id]));

        await db.run(
            `INSERT INTO processes (id, firma, konum, baslik, surec, mevcutDurum, baslangicTarihi, sonrakiKontrolTarihi, tamamlanmaTarihi, kategori, altKategori, oncelikDuzeyi, durum) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ...Object.values(processData)
        );

        for (const fullName of sorumlular) {
            const userId = userMap.get(fullName);
            if (userId) {
                await db.run('INSERT INTO process_assignments (processId, userId) VALUES (?, ?)', newId, userId);
            }
        }

        // Log oluştur
        // await createLogEntry(db, { /* log verileri */ });

        req.io.emit('data_changed'); // Tüm client'lara haber ver
        res.status(201).json({ message: 'Süreç başarıyla oluşturuldu.', processId: newId });
    } catch (error) {
        console.error("Süreç oluşturma hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Süreç güncelleme
exports.updateProcess = async (req, res) => {
    const { id } = req.params;
    const { sorumlular, ...processData } = req.body;

    try {
        const db = await getDb();
        const userMap = new Map((await db.all('SELECT id, fullName FROM users')).map(u => [u.fullName, u.id]));

        await db.run(
            `UPDATE processes SET firma=?, konum=?, baslik=?, surec=?, mevcutDurum=?, baslangicTarihi=?, sonrakiKontrolTarihi=?, tamamlanmaTarihi=?, kategori=?, altKategori=?, oncelikDuzeyi=?, durum=? WHERE id=?`,
            processData.firma, processData.konum, processData.baslik, processData.surec, processData.mevcutDurum, processData.baslangicTarihi, processData.sonrakiKontrolTarihi, processData.tamamlanmaTarihi, processData.kategori, processData.altKategori, processData.oncelikDuzeyi, processData.durum, id
        );

        // Sorumluları güncelle: önce eskileri sil, sonra yenileri ekle
        await db.run('DELETE FROM process_assignments WHERE processId = ?', id);
        for (const fullName of sorumlular) {
            const userId = userMap.get(fullName);
            if (userId) {
                await db.run('INSERT INTO process_assignments (processId, userId) VALUES (?, ?)', id, userId);
            }
        }

        req.io.emit('data_changed');
        res.status(200).json({ message: 'Süreç başarıyla güncellendi.' });
    } catch (error) {
        console.error("Süreç güncelleme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Süreç silme
exports.deleteProcess = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDb();
        await db.run('DELETE FROM processes WHERE id = ?', id);
        // İlişkili atamalar 'ON DELETE CASCADE' ile otomatik silinecek

        req.io.emit('data_changed');
        res.status(200).json({ message: 'Süreç başarıyla silindi.' });
    } catch (error) {
        console.error("Süreç silme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};