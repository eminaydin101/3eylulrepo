const { getDb } = require('../config/database');

// Bu fonksiyon, veritabanına log kaydı ekler.
const createLogEntry = async (db, logData) => {
    const { userId, userName, processId, field, oldValue, newValue } = logData;
    // Sadece gerçekten bir değişiklik varsa logla
    if (String(oldValue) !== String(newValue)) {
        await db.run(
            `INSERT INTO logs (userId, userName, processId, field, oldValue, newValue) VALUES (?, ?, ?, ?, ?, ?)`,
            userId, userName, processId, field, String(oldValue), String(newValue)
        );
    }
};

// Benzersiz ID oluşturma fonksiyonu
const generateProcessId = async (db) => {
    const result = await db.get('SELECT MAX(CAST(id AS INTEGER)) as maxId FROM processes WHERE id REGEXP "^[0-9]+$"');
    const nextId = (result.maxId || 0) + 1;
    return String(nextId).padStart(6, '0');
};

exports.getInitialData = async (req, res) => {
    try {
        const db = await getDb();
        const processesRaw = await db.all('SELECT * FROM processes ORDER BY baslangicTarihi DESC');
        const users = await db.all('SELECT id, fullName, email, role, status FROM users');
        const assignments = await db.all('SELECT * FROM process_assignments');
        const logs = await db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');

        const processes = processesRaw.map(p => {
            const respIds = assignments.filter(a => a.processId === p.id).map(a => a.userId);
            const sorumlular = respIds.map(id => users.find(u => u.id === id)?.fullName).filter(Boolean);
            return { ...p, sorumlular };
        });

        const firmalar = { 
            "Sera": ["Merkez", "Van", "Teknopark"], 
            "Van": ["Bil", "İn", "Endüstri"], 
            "Mik": ["Bos", "Ad", "Çarşı"], 
            "Alfa": ["İstanbul", "Ankara"] 
        };
        
        const kategoriler = { 
            "Yazılım": ["Web Geliştirme", "Mobil Geliştirme", "Veritabanı Yönetimi"], 
            "Finans": ["Muhasebe", "Bütçe", "Denetim"], 
            "BT": ["Altyapı", "Siber Güvenlik", "Donanım"], 
            "Yönetim": ["İnsan Kaynakları", "Operasyon", "Pazarlama"] 
        };

        res.status(200).json({ processes, users, firmalar, kategoriler, logs });
    } catch (error) {
        console.error("Başlangıç verileri alınırken hata:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

exports.createProcess = async (req, res) => {
    const { sorumlular, ...processData } = req.body;
    
    try {
        const db = await getDb();
        
        // Yeni ID oluştur
        const newId = await generateProcessId(db);
        
        // Süreç verisini ekle
        await db.run(
            `INSERT INTO processes (id, firma, konum, baslik, surec, mevcutDurum, baslangicTarihi, sonrakiKontrolTarihi, tamamlanmaTarihi, kategori, altKategori, oncelikDuzeyi, durum) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            newId, processData.firma, processData.konum, processData.baslik, 
            processData.surec, processData.mevcutDurum, processData.baslangicTarihi, 
            processData.sonrakiKontrolTarihi, processData.tamamlanmaTarihi, 
            processData.kategori, processData.altKategori, processData.oncelikDuzeyi, 
            processData.durum
        );

        // Sorumluları ekle
        if (sorumlular && sorumlular.length > 0) {
            const allUsers = await db.all('SELECT id, fullName FROM users');
            const userMap = new Map(allUsers.map(u => [u.fullName, u.id]));
            
            for (const fullName of sorumlular) {
                const userId = userMap.get(fullName);
                if (userId) {
                    await db.run(
                        'INSERT INTO process_assignments (processId, userId) VALUES (?, ?)',
                        newId, userId
                    );
                }
            }
        }

        // Log kaydı oluştur
        await createLogEntry(db, {
            userId: 1, // TODO: Gerçek kullanıcı ID'si JWT'den alınmalı
            userName: "Sistem", 
            processId: newId,
            field: "Oluşturma", 
            oldValue: "", 
            newValue: "Yeni süreç oluşturuldu"
        });

        req.io.emit('data_changed');
        res.status(201).json({ message: 'Süreç başarıyla oluşturuldu.', id: newId });
    } catch (error) {
        console.error("Süreç oluşturma hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.updateProcess = async (req, res) => {
    const { id } = req.params;
    const { sorumlular, ...processData } = req.body;
    // Not: Gerçek bir uygulamada bu bilgi JWT'den çözülen token'dan gelir.
    // Şimdilik test için manuel olarak ekliyoruz.
    const currentUser = { userId: 1, userName: "Sistem" }; 

    try {
        const db = await getDb();
        const oldProcess = await db.get('SELECT * FROM processes WHERE id = ?', id);

        if (!oldProcess) {
            return res.status(404).json({ message: "Süreç bulunamadı." });
        }

        // Değişiklikleri logla
        for (const key in processData) {
            if (key in oldProcess && oldProcess[key] !== processData[key]) {
                await createLogEntry(db, {
                    userId: currentUser.userId, 
                    userName: currentUser.userName, 
                    processId: id,
                    field: key, 
                    oldValue: oldProcess[key], 
                    newValue: processData[key]
                });
            }
        }

        // Süreci güncelle
        await db.run(
            `UPDATE processes SET firma=?, konum=?, baslik=?, surec=?, mevcutDurum=?, baslangicTarihi=?, sonrakiKontrolTarihi=?, tamamlanmaTarihi=?, kategori=?, altKategori=?, oncelikDuzeyi=?, durum=? WHERE id=?`,
            processData.firma, processData.konum, processData.baslik, processData.surec, 
            processData.mevcutDurum, processData.baslangicTarihi, processData.sonrakiKontrolTarihi, 
            processData.tamamlanmaTarihi, processData.kategori, processData.altKategori, 
            processData.oncelikDuzeyi, processData.durum, id
        );

        // Sorumluları güncelle
        await db.run('DELETE FROM process_assignments WHERE processId = ?', id);
        if (sorumlular && sorumlular.length > 0) {
            const allUsers = await db.all('SELECT id, fullName FROM users');
            const userMap = new Map(allUsers.map(u => [u.fullName, u.id]));
            
            for (const fullName of sorumlular) {
                const userId = userMap.get(fullName);
                if (userId) {
                    await db.run('INSERT INTO process_assignments (processId, userId) VALUES (?, ?)', id, userId);
                }
            }
        }

        req.io.emit('data_changed');
        res.status(200).json({ message: 'Süreç başarıyla güncellendi.' });
    } catch (error) {
        console.error("Süreç güncelleme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.deleteProcess = async (req, res) => {
    const { id } = req.params;

    try {
        const db = await getDb();
        
        // Sürecin var olup olmadığını kontrol et
        const process = await db.get('SELECT * FROM processes WHERE id = ?', id);
        if (!process) {
            return res.status(404).json({ message: "Süreç bulunamadı." });
        }

        // Log kaydı oluştur
        await createLogEntry(db, {
            userId: 1, // TODO: Gerçek kullanıcı ID'si JWT'den alınmalı
            userName: "Sistem", 
            processId: id,
            field: "Silme", 
            oldValue: process.baslik, 
            newValue: "Süreç silindi"
        });

        // İlişkili verileri sil (CASCADE çalışacak ama güvenlik için manuel siliyoruz)
        await db.run('DELETE FROM process_assignments WHERE processId = ?', id);
        
        // Ana süreci sil
        await db.run('DELETE FROM processes WHERE id = ?', id);

        req.io.emit('data_changed');
        res.status(200).json({ message: 'Süreç başarıyla silindi.' });
    } catch (error) {
        console.error("Süreç silme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};