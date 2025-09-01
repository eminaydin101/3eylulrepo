const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Logo upload konfigürasyonu
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const logoUpload = multer({ 
    storage: logoStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        
        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir'));
        }
    }
});

// Sistem ayarlarını getir
router.get('/settings', authMiddleware, async (req, res) => {
    try {
        // Sadece admin ve superadmin erişebilir
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        const db = await getDb();
        const settings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        if (!settings) {
            // Default settings oluştur
            await db.run('INSERT INTO system_settings (id) VALUES (1)');
            const defaultSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
            return res.status(200).json(defaultSettings);
        }

        res.status(200).json(settings);
    } catch (error) {
        console.error('Sistem ayarları getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Sistem ayarlarını güncelle
router.post('/settings', authMiddleware, logoUpload.single('logo'), async (req, res) => {
    try {
        // Sadece admin ve superadmin erişebilir
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        const db = await getDb();
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

        let logoUrl = null;
        if (req.file) {
            logoUrl = `/uploads/logos/${req.file.filename}`;
        }

        const updateFields = [];
        const updateValues = [];

        if (siteName) {
            updateFields.push('siteName = ?');
            updateValues.push(siteName);
        }
        if (siteDescription) {
            updateFields.push('siteDescription = ?');
            updateValues.push(siteDescription);
        }
        if (logoUrl) {
            updateFields.push('logoUrl = ?');
            updateValues.push(logoUrl);
        }
        if (primaryColor) {
            updateFields.push('primaryColor = ?');
            updateValues.push(primaryColor);
        }
        if (secondaryColor) {
            updateFields.push('secondaryColor = ?');
            updateValues.push(secondaryColor);
        }
        if (allowRegistration !== undefined) {
            updateFields.push('allowRegistration = ?');
            updateValues.push(allowRegistration ? 1 : 0);
        }
        if (requireEmailVerification !== undefined) {
            updateFields.push('requireEmailVerification = ?');
            updateValues.push(requireEmailVerification ? 1 : 0);
        }
        if (defaultUserRole) {
            updateFields.push('defaultUserRole = ?');
            updateValues.push(defaultUserRole);
        }
        if (sessionTimeout) {
            updateFields.push('sessionTimeout = ?');
            updateValues.push(parseInt(sessionTimeout));
        }
        if (maxFileSize) {
            updateFields.push('maxFileSize = ?');
            updateValues.push(parseInt(maxFileSize));
        }
        if (allowedFileTypes) {
            updateFields.push('allowedFileTypes = ?');
            updateValues.push(allowedFileTypes);
        }
        if (emailNotifications !== undefined) {
            updateFields.push('emailNotifications = ?');
            updateValues.push(emailNotifications ? 1 : 0);
        }
        if (systemLanguage) {
            updateFields.push('systemLanguage = ?');
            updateValues.push(systemLanguage);
        }
        if (dateFormat) {
            updateFields.push('dateFormat = ?');
            updateValues.push(dateFormat);
        }
        if (currency) {
            updateFields.push('currency = ?');
            updateValues.push(currency);
        }

        if (updateFields.length > 0) {
            updateFields.push('updatedAt = ?');
            updateValues.push(new Date().toISOString());
            updateValues.push(1); // WHERE id = 1

            const updateQuery = `UPDATE system_settings SET ${updateFields.join(', ')} WHERE id = ?`;
            await db.run(updateQuery, updateValues);
        }

        // Güncellenmiş ayarları döndür
        const updatedSettings = await db.get('SELECT * FROM system_settings WHERE id = 1');
        
        req.io.emit('system_settings_updated', updatedSettings);
        res.status(200).json({ 
            message: 'Sistem ayarları güncellendi',
            settings: updatedSettings 
        });
    } catch (error) {
        console.error('Sistem ayarları güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;