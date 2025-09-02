const { getDb } = require('../config/database');
const { sendProcessNotification, sendBulkNotification } = require('../services/emailService');

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

// Sorumlu kullanıcıların emaillerini getir
const getResponsibleEmails = async (db, processId) => {
    const emails = await db.all(`
        SELECT DISTINCT u.email 
        FROM users u 
        JOIN process_assignments pa ON u.id = pa.userId 
        WHERE pa.processId = ? AND u.status = 'Active'
    `, processId);
    return emails.map(row => row.email);
};

// Benzersiz ID oluşturma fonksiyonu
// Benzersiz ID oluşturma fonksiyonu - REGEXP sorunu düzeltildi
const generateProcessId = async (db) => {
    try {
        // Tüm ID'leri al ve numerik olanları filtrele
        const allProcesses = await db.all('SELECT id FROM processes');
        const numericIds = allProcesses
            .map(p => p.id)
            .filter(id => /^\d+$/.test(id)) // JavaScript ile regex kontrolü
            .map(id => parseInt(id, 10))
            .filter(id => !isNaN(id));
        
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const nextId = maxId + 1;
        
        return String(nextId).padStart(6, '0');
    } catch (error) {
        console.error('ID oluşturma hatası:', error);
        // Fallback: timestamp tabanlı ID
        return Date.now().toString();
    }
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
        res.status(500).json({ message: "Sunucu hatası oluştu: " + error.message });
    }
};

exports.createProcess = async (req, res) => {
    try {
        const { sorumlular, ...processData } = req.body;
        
        // Validation
        if (!processData.firma || !processData.konum || !processData.baslik || !processData.surec || !processData.kategori) {
            return res.status(400).json({ 
                message: 'Zorunlu alanlar eksik: Firma, Konum, Başlık, Süreç ve Kategori gereklidir' 
            });
        }
        
        const db = await getDb();
        
        // Yeni ID oluştur
        const newId = await generateProcessId(db);
        
        // Süreç verisini ekle
        await db.run(
            `INSERT INTO processes (id, firma, konum, baslik, surec, mevcutDurum, baslangicTarihi, sonrakiKontrolTarihi, tamamlanmaTarihi, kategori, altKategori, oncelikDuzeyi, durum) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            newId, 
            processData.firma || '', 
            processData.konum || '', 
            processData.baslik || '', 
            processData.surec || '', 
            processData.mevcutDurum || '', 
            processData.baslangicTarihi || new Date().toISOString().slice(0, 10), 
            processData.sonrakiKontrolTarihi || '', 
            processData.tamamlanmaTarihi || '', 
            processData.kategori || '', 
            processData.altKategori || '', 
            processData.oncelikDuzeyi || 'Normal', 
            processData.durum || 'Aktif'
        );

        // Sorumluları ekle ve email listesi oluştur
        const responsibleEmails = [];
        if (sorumlular && Array.isArray(sorumlular) && sorumlular.length > 0) {
            const allUsers = await db.all('SELECT id, fullName, email FROM users');
            const userMap = new Map(allUsers.map(u => [u.fullName, { id: u.id, email: u.email }]));
            
            for (const fullName of sorumlular) {
                const user = userMap.get(fullName);
                if (user) {
                    await db.run(
                        'INSERT OR IGNORE INTO process_assignments (processId, userId) VALUES (?, ?)',
                        newId, user.id
                    );
                    if (user.email) {
                        responsibleEmails.push(user.email);
                    }
                }
            }
        }

        // Log kaydı oluştur
        await createLogEntry(db, {
            userId: req.user?.id || 1,
            userName: req.user?.name || "Sistem", 
            processId: newId,
            field: "Oluşturma", 
            oldValue: "", 
            newValue: "Yeni süreç oluşturuldu"
        });

        // Email bildirimi gönder (hata durumunda işlemi durdurmaz)
        try {
            if (responsibleEmails.length > 0) {
                const processWithResponsibles = { ...processData, id: newId, sorumlular };
                await sendBulkNotification(
                    responsibleEmails,
                    `Yeni Süreç Atandı: ${processData.baslik}`,
                    processWithResponsibles
                );
            }
        } catch (emailError) {
            console.error('Email gönderme hatası (süreç oluşturuldu):', emailError);
        }

        // Socket event emit
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(201).json({ message: 'Süreç başarıyla oluşturuldu.', id: newId });
    } catch (error) {
        console.error("Süreç oluşturma hatası:", error);
        res.status(500).json({ message: 'Süreç oluşturma hatası: ' + error.message });
    }
};

// updateProcess fonksiyonunu bu şekilde güncelleyin:

exports.updateProcess = async (req, res) => {
    const { id } = req.params;
    const { sorumlular, ...processData } = req.body;
    const currentUser = { userId: req.user?.id || 1, userName: req.user?.name || "Sistem" };

    try {
        const db = await getDb();
        const oldProcess = await db.get('SELECT * FROM processes WHERE id = ?', id);

        if (!oldProcess) {
            return res.status(404).json({ message: "Süreç bulunamadı." });
        }

        // Önemli değişiklikler için email bildirimi
        const criticalFields = ['durum', 'oncelikDuzeyi', 'sonrakiKontrolTarihi'];
        const criticalChanges = {};
        
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
                
                if (criticalFields.includes(key)) {
                    criticalChanges[key] = { old: oldProcess[key], new: processData[key] };
                }
            }
        }

        // Tablodan sütun bilgilerini al
        const tableInfo = await db.all("PRAGMA table_info(processes)");
        const columnNames = tableInfo.map(col => col.name);
        const hasUpdatedAt = columnNames.includes('updatedAt');

        // Süreci güncelle - updatedAt sütunu varsa kullan
        let updateQuery = `UPDATE processes SET 
            firma=?, konum=?, baslik=?, surec=?, mevcutDurum=?, 
            baslangicTarihi=?, sonrakiKontrolTarihi=?, tamamlanmaTarihi=?, 
            kategori=?, altKategori=?, oncelikDuzeyi=?, durum=?`;
        
        const updateParams = [
            processData.firma || '', 
            processData.konum || '', 
            processData.baslik || '', 
            processData.surec || '', 
            processData.mevcutDurum || '', 
            processData.baslangicTarihi || '', 
            processData.sonrakiKontrolTarihi || '', 
            processData.tamamlanmaTarihi || '', 
            processData.kategori || '', 
            processData.altKategori || '', 
            processData.oncelikDuzeyi || 'Normal', 
            processData.durum || 'Aktif'
        ];

        if (hasUpdatedAt) {
            updateQuery += `, updatedAt=?`;
            updateParams.push(new Date().toISOString());
        }
        
        updateQuery += ` WHERE id=?`;
        updateParams.push(id);

        await db.run(updateQuery, updateParams);

        // Sorumluları güncelle
        await db.run('DELETE FROM process_assignments WHERE processId = ?', id);
        const responsibleEmails = [];
        if (sorumlular && Array.isArray(sorumlular) && sorumlular.length > 0) {
            const allUsers = await db.all('SELECT id, fullName, email FROM users');
            const userMap = new Map(allUsers.map(u => [u.fullName, { id: u.id, email: u.email }]));
            
            for (const fullName of sorumlular) {
                const user = userMap.get(fullName);
                if (user) {
                    await db.run('INSERT OR IGNORE INTO process_assignments (processId, userId) VALUES (?, ?)', id, user.id);
                    if (user.email) {
                        responsibleEmails.push(user.email);
                    }
                }
            }
        }

        // Kritik değişiklikler için email gönder
        try {
            if (Object.keys(criticalChanges).length > 0 && responsibleEmails.length > 0) {
                const updatedProcess = { ...processData, id, sorumlular };
                let subject = `Süreç Güncellendi: ${processData.baslik}`;
                
                if (criticalChanges.durum) {
                    subject = `Süreç Durumu Değişti: ${processData.baslik}`;
                } else if (criticalChanges.oncelikDuzeyi) {
                    subject = `Süreç Önceliği Değişti: ${processData.baslik}`;
                }
                
                const { sendBulkNotification } = require('../services/emailService');
                await sendBulkNotification(responsibleEmails, subject, updatedProcess);
            }
        } catch (emailError) {
            console.error('Email gönderme hatası (süreç güncellendi):', emailError);
        }

        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ message: 'Süreç başarıyla güncellendi.' });
    } catch (error) {
        console.error("Süreç güncelleme hatası:", error);
        res.status(500).json({ message: 'Süreç güncelleme hatası: ' + error.message });
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

        // Sorumlu kullanıcıların emaillerini al
        const responsibleEmails = await getResponsibleEmails(db, id);

        // Log kaydı oluştur
        await createLogEntry(db, {
            userId: req.user?.id || 1,
            userName: req.user?.name || "Sistem", 
            processId: id,
            field: "Silme", 
            oldValue: process.baslik, 
            newValue: "Süreç silindi"
        });

        // İlişkili verileri sil
        await db.run('DELETE FROM process_assignments WHERE processId = ?', id);
        await db.run('DELETE FROM process_files WHERE processId = ?', id);
        
        // Ana süreci sil
        await db.run('DELETE FROM processes WHERE id = ?', id);

        // Email bildirimi gönder (hata durumunda işlemi durdurmaz)
        try {
            if (responsibleEmails.length > 0) {
                await sendBulkNotification(
                    responsibleEmails,
                    `Süreç Silindi: ${process.baslik}`,
                    { ...process, sorumlular: responsibleEmails }
                );
            }
        } catch (emailError) {
            console.error('Email gönderme hatası (süreç silindi):', emailError);
        }

        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ message: 'Süreç başarıyla silindi.' });
    } catch (error) {
        console.error("Süreç silme hatası:", error);
        res.status(500).json({ message: 'Süreç silme hatası: ' + error.message });
    }
};