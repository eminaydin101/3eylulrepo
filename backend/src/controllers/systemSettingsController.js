const { getDb } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Logo yükleme konfigürasyonu
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo-${Date.now()}${ext}`);
    }
});

const logoUpload = multer({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF)'));
        }
    }
});

// Sistem ayarlarını getir
exports.getSystemSettings = async (req, res) => {
    try {
        const db = await getDb();
        let settings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        // Eğer ayarlar yoksa varsayılan ayarları oluştur
        if (!settings) {
            const defaultSettings = {
                siteName: 'Süreç Yönetimi',
                siteDescription: 'Profesyonel süreç takip ve yönetim sistemi',
                logoUrl: null,
                primaryColor: '#2563eb',
                secondaryColor: '#64748b',
                allowRegistration: 1,
                requireEmailVerification: 1,
                defaultUserRole: 'Viewer',
                sessionTimeout || existingSettings.sessionTimeout,
                maxFileSize || existingSettings.maxFileSize,
                allowedFileTypes || existingSettings.allowedFileTypes,
                emailNotifications !== undefined ? emailNotifications : existingSettings.emailNotifications,
                systemLanguage || existingSettings.systemLanguage,
                dateFormat || existingSettings.dateFormat,
                currency || existingSettings.currency,
                new Date().toISOString()
            ]);
        } else {
            // Yeni kayıt oluştur
            await db.run(`
                INSERT INTO system_settings (
                    siteName, siteDescription, primaryColor, secondaryColor,
                    allowRegistration, requireEmailVerification, defaultUserRole,
                    sessionTimeout, maxFileSize, allowedFileTypes, emailNotifications,
                    systemLanguage, dateFormat, currency, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                siteName,
                siteDescription || 'Profesyonel süreç takip ve yönetim sistemi',
                primaryColor || '#2563eb',
                secondaryColor || '#64748b',
                allowRegistration !== undefined ? allowRegistration : 1,
                requireEmailVerification !== undefined ? requireEmailVerification : 1,
                defaultUserRole || 'Viewer',
                sessionTimeout || 24,
                maxFileSize || 50,
                allowedFileTypes || '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip',
                emailNotifications !== undefined ? emailNotifications : 1,
                systemLanguage || 'tr',
                dateFormat || 'DD/MM/YYYY',
                currency || 'TRY',
                new Date().toISOString(),
                new Date().toISOString()
            ]);
        }
        
        // Güncellenmiş ayarları getir
        const updatedSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        // Socket ile tüm istemcilere bildir
        if (req.io) {
            req.io.emit('system_settings_updated', updatedSettings);
        }
        
        res.status(200).json({
            message: 'Sistem ayarları başarıyla güncellendi',
            settings: updatedSettings
        });
        
    } catch (error) {
        console.error('Sistem ayarları güncellenirken hata:', error);
        res.status(500).json({ message: 'Sistem ayarları güncellenemedi: ' + error.message });
    }
};

// Logo yükleme
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Logo dosyası yüklenmedi' });
        }
        
        const db = await getDb();
        const logoUrl = `/uploads/logos/${req.file.filename}`;
        
        // Eski logoyu sil
        const oldSettings = await db.get('SELECT logoUrl FROM system_settings WHERE id = 1');
        if (oldSettings && oldSettings.logoUrl) {
            const oldLogoPath = path.join(__dirname, '../..', oldSettings.logoUrl);
            if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
            }
        }
        
        // Yeni logo URL'ini kaydet
        await db.run('UPDATE system_settings SET logoUrl = ?, updatedAt = ? WHERE id = 1', [
            logoUrl,
            new Date().toISOString()
        ]);
        
        const updatedSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        if (req.io) {
            req.io.emit('system_settings_updated', updatedSettings);
        }
        
        res.status(200).json({
            message: 'Logo başarıyla yüklendi',
            logoUrl: logoUrl,
            settings: updatedSettings
        });
        
    } catch (error) {
        console.error('Logo yükleme hatası:', error);
        res.status(500).json({ message: 'Logo yüklenemedi: ' + error.message });
    }
};

// Logo silme
exports.deleteLogo = async (req, res) => {
    try {
        const db = await getDb();
        const settings = await db.get('SELECT logoUrl FROM system_settings WHERE id = 1');
        
        if (!settings || !settings.logoUrl) {
            return res.status(404).json({ message: 'Silinecek logo bulunamadı' });
        }
        
        // Dosyayı sil
        const logoPath = path.join(__dirname, '../..', settings.logoUrl);
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }
        
        // Veritabanından logo URL'ini kaldır
        await db.run('UPDATE system_settings SET logoUrl = NULL, updatedAt = ? WHERE id = 1', [
            new Date().toISOString()
        ]);
        
        const updatedSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        if (req.io) {
            req.io.emit('system_settings_updated', updatedSettings);
        }
        
        res.status(200).json({
            message: 'Logo başarıyla silindi',
            settings: updatedSettings
        });
        
    } catch (error) {
        console.error('Logo silme hatası:', error);
        res.status(500).json({ message: 'Logo silinemedi: ' + error.message });
    }
};

// Email ayarlarını test et
exports.testEmailSettings = async (req, res) => {
    try {
        const { testEmail } = req.body;
        
        if (!testEmail) {
            return res.status(400).json({ message: 'Test email adresi gereklidir' });
        }
        
        // Email servisi kullanarak test emaili gönder
        const emailService = require('../services/emailService');
        
        const testEmailContent = {
            subject: 'Test Email - Süreç Yönetimi',
            text: 'Bu bir test emailidir. Email ayarlarınız doğru şekilde yapılandırılmış.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Email Test Başarılı!</h2>
                    <p>Bu bir test emailidir. Email ayarlarınız doğru şekilde yapılandırılmış.</p>
                    <p style="color: #64748b; font-size: 14px;">
                        Gönderim zamanı: ${new Date().toLocaleString('tr-TR', {
                            timeZone: 'Europe/Istanbul'
                        })}
                    </p>
                </div>
            `
        };
        
        await emailService.sendEmail(testEmail, testEmailContent.subject, testEmailContent.text, testEmailContent.html);
        
        res.status(200).json({
            message: 'Test emaili başarıyla gönderildi',
            testEmail
        });
        
    } catch (error) {
        console.error('Email test hatası:', error);
        res.status(500).json({ 
            message: 'Email test başarısız: ' + error.message,
            error: error.message 
        });
    }
};

// Sistem durumunu kontrol et
exports.getSystemStatus = async (req, res) => {
    try {
        const db = await getDb();
        
        // Çeşitli sistem metriklerini topla
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        const processCount = await db.get('SELECT COUNT(*) as count FROM processes');
        const logCount = await db.get('SELECT COUNT(*) as count FROM logs');
        const activeUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE status = "Active"');
        
        // Disk kullanımı (yaklaşık)
        const uploadsDir = path.join(__dirname, '../../uploads');
        let uploadSize = 0;
        
        if (fs.existsSync(uploadsDir)) {
            const calculateDirSize = (dir) => {
                let size = 0;
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        size += calculateDirSize(filePath);
                    } else {
                        size += stats.size;
                    }
                }
                return size;
            };
            uploadSize = calculateDirSize(uploadsDir);
        }
        
        // Son aktivite
        const lastLog = await db.get('SELECT timestamp FROM logs ORDER BY timestamp DESC LIMIT 1');
        
        const systemStatus = {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                userCount: userCount.count,
                processCount: processCount.count,
                logCount: logCount.count,
                activeUsers: activeUsers.count
            },
            storage: {
                uploadSize: `${(uploadSize / 1024 / 1024).toFixed(2)} MB`,
                uploadSizeBytes: uploadSize
            },
            activity: {
                lastActivity: lastLog?.timestamp || null
            },
            memory: {
                used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
            },
            version: '1.0.0'
        };
        
        res.status(200).json(systemStatus);
        
    } catch (error) {
        console.error('Sistem durumu alınırken hata:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Sistem durumu alınamadı: ' + error.message 
        });
    }
};

// Veritabanı optimizasyonu
exports.optimizeDatabase = async (req, res) => {
    try {
        const db = await getDb();
        
        // SQLite VACUUM komutu ile veritabanını optimize et
        await db.run('VACUUM');
        
        // ANALYZE komutu ile istatistikleri güncelle
        await db.run('ANALYZE');
        
        // Eski log kayıtlarını temizle (90 günden eski)
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 90);
        const result = await db.run('DELETE FROM logs WHERE timestamp < ?', [oldDate.toISOString()]);
        
        res.status(200).json({
            message: 'Veritabanı optimizasyonu tamamlandı',
            stats: {
                deletedOldLogs: result.changes || 0,
                optimizationDate: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Veritabanı optimizasyon hatası:', error);
        res.status(500).json({ message: 'Veritabanı optimize edilemedi: ' + error.message });
    }
};

// Sistem ayarlarını varsayılana sıfırla
exports.resetToDefaults = async (req, res) => {
    try {
        const db = await getDb();
        
        const defaultSettings = {
            siteName: 'Süreç Yönetimi',
            siteDescription: 'Profesyonel süreç takip ve yönetim sistemi',
            logoUrl: null,
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            allowRegistration: 1,
            requireEmailVerification: 1,
            defaultUserRole: 'Viewer',
            sessionTimeout: 24,
            maxFileSize: 50,
            allowedFileTypes: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip',
            emailNotifications: 1,
            systemLanguage: 'tr',
            dateFormat: 'DD/MM/YYYY',
            currency: 'TRY'
        };
        
        // Mevcut logoyu sil
        const currentSettings = await db.get('SELECT logoUrl FROM system_settings WHERE id = 1');
        if (currentSettings && currentSettings.logoUrl) {
            const logoPath = path.join(__dirname, '../..', currentSettings.logoUrl);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }
        
        // Ayarları varsayılana sıfırla
        await db.run(`
            UPDATE system_settings SET
                siteName = ?,
                siteDescription = ?,
                logoUrl = ?,
                primaryColor = ?,
                secondaryColor = ?,
                allowRegistration = ?,
                requireEmailVerification = ?,
                defaultUserRole = ?,
                sessionTimeout = ?,
                maxFileSize = ?,
                allowedFileTypes = ?,
                emailNotifications = ?,
                systemLanguage = ?,
                dateFormat = ?,
                currency = ?,
                updatedAt = ?
            WHERE id = 1
        `, [
            defaultSettings.siteName,
            defaultSettings.siteDescription,
            defaultSettings.logoUrl,
            defaultSettings.primaryColor,
            defaultSettings.secondaryColor,
            defaultSettings.allowRegistration,
            defaultSettings.requireEmailVerification,
            defaultSettings.defaultUserRole,
            defaultSettings.sessionTimeout,
            defaultSettings.maxFileSize,
            defaultSettings.allowedFileTypes,
            defaultSettings.emailNotifications,
            defaultSettings.systemLanguage,
            defaultSettings.dateFormat,
            defaultSettings.currency,
            new Date().toISOString()
        ]);
        
        const resetSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        if (req.io) {
            req.io.emit('system_settings_updated', resetSettings);
        }
        
        res.status(200).json({
            message: 'Sistem ayarları varsayılana sıfırlandı',
            settings: resetSettings
        });
        
    } catch (error) {
        console.error('Sistem ayarları sıfırlama hatası:', error);
        res.status(500).json({ message: 'Sistem ayarları sıfırlanamadı: ' + error.message });
    }
};

// Multer middleware'i export et
exports.uploadLogoMiddleware = logoUpload.single('logo');: 24,
                maxFileSize: 50,
                allowedFileTypes: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip',
                emailNotifications: 1,
                systemLanguage: 'tr',
                dateFormat: 'DD/MM/YYYY',
                currency: 'TRY'
            };
            
            await db.run(`
                INSERT INTO system_settings (
                    siteName, siteDescription, logoUrl, primaryColor, secondaryColor,
                    allowRegistration, requireEmailVerification, defaultUserRole,
                    sessionTimeout, maxFileSize, allowedFileTypes, emailNotifications,
                    systemLanguage, dateFormat, currency, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                defaultSettings.siteName,
                defaultSettings.siteDescription,
                defaultSettings.logoUrl,
                defaultSettings.primaryColor,
                defaultSettings.secondaryColor,
                defaultSettings.allowRegistration,
                defaultSettings.requireEmailVerification,
                defaultSettings.defaultUserRole,
                defaultSettings.sessionTimeout,
                defaultSettings.maxFileSize,
                defaultSettings.allowedFileTypes,
                defaultSettings.emailNotifications,
                defaultSettings.systemLanguage,
                defaultSettings.dateFormat,
                defaultSettings.currency,
                new Date().toISOString(),
                new Date().toISOString()
            ]);
            
            settings = { id: 1, ...defaultSettings };
        }
        
        res.status(200).json(settings);
    } catch (error) {
        console.error('Sistem ayarları alınırken hata:', error);
        res.status(500).json({ message: 'Sistem ayarları alınamadı: ' + error.message });
    }
};

// Sistem ayarlarını güncelle
exports.updateSystemSettings = async (req, res) => {
    try {
        const {
            siteName,
            siteDescription,
            primaryColor,
            secondaryColor,
            allowRegistration,
            requireEmailVerification,
            defaultUserRole,
            sessionTimeout,
            maxFileSize,
            allowedFileTypes,
            emailNotifications,
            systemLanguage,
            dateFormat,
            currency
        } = req.body;
        
        // Validation
        if (!siteName || siteName.trim() === '') {
            return res.status(400).json({ message: 'Site adı gereklidir' });
        }
        
        if (sessionTimeout && (sessionTimeout < 1 || sessionTimeout > 168)) {
            return res.status(400).json({ message: 'Oturum süresi 1-168 saat arasında olmalıdır' });
        }
        
        if (maxFileSize && (maxFileSize < 1 || maxFileSize > 100)) {
            return res.status(400).json({ message: 'Maksimum dosya boyutu 1-100 MB arasında olmalıdır' });
        }
        
        const db = await getDb();
        
        // Mevcut ayarları kontrol et
        const existingSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        if (existingSettings) {
            // Güncelleme
            await db.run(`
            UPDATE system_settings SET
                siteName = ?,
                siteDescription = ?,
                logoUrl = ?,
                primaryColor = ?,
                secondaryColor = ?,
                allowRegistration = ?,
                requireEmailVerification = ?,
                defaultUserRole = ?,
                sessionTimeout = ?,
                maxFileSize = ?,
                allowedFileTypes = ?,
                emailNotifications = ?,
                systemLanguage = ?,
                dateFormat = ?,
                currency = ?,
                updatedAt = ?
            WHERE id = 1
        `, [
            defaultSettings.siteName,
            defaultSettings.siteDescription,
            defaultSettings.logoUrl,
            defaultSettings.primaryColor,
            defaultSettings.secondaryColor,
            defaultSettings.allowRegistration,
            defaultSettings.requireEmailVerification,
            defaultSettings.defaultUserRole,
            defaultSettings.sessionTimeout,
            defaultSettings.maxFileSize,
            defaultSettings.allowedFileTypes,
            defaultSettings.emailNotifications,
            defaultSettings.systemLanguage,
            defaultSettings.dateFormat,
            defaultSettings.currency,
            new Date().toISOString()
        ]);
        
        const resetSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        if (req.io) {
            req.io.emit('system_settings_updated', resetSettings);
        }
        
        res.status(200).json({
            message: 'Sistem ayarları varsayılana sıfırlandı',
            settings: resetSettings
        });
        
    } catch (error) {
        console.error('Sistem ayarları sıfırlama hatası:', error);
        res.status(500).json({ message: 'Sistem ayarları sıfırlanamadı: ' + error.message });
    }
};

// Multer middleware'i export et
exports.uploadLogoMiddleware = logoUpload.single('logo');
