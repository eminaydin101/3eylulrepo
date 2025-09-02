const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const backupController = require('../controllers/backupController');

// Tüm backup işlemleri için yetkilendirme gerekli
router.use(authMiddleware);

// Admin ve SuperAdmin kontrolü
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    next();
};

// Backup listesini getir
router.get('/', requireAdmin, backupController.getBackups);

// Veritabanı yedeği oluştur
router.post('/database', requireAdmin, backupController.createDatabaseBackup);

// YENİ: Backup import et
router.post('/import', requireAdmin, backupController.uploadBackup, backupController.importBackup);

// Geçici dosyaları temizle
router.post('/clean-temp', requireAdmin, backupController.cleanTempFiles);

// Sistem raporu oluştur
router.post('/system-report', requireAdmin, backupController.generateSystemReport);

// Tüm logları temizle
router.post('/clear-logs', requireAdmin, backupController.clearAllLogs);

// Fabrika ayarlarına sıfırla
router.post('/factory-reset', requireAdmin, backupController.factoryReset);

// Backup indir
router.get('/download/:fileName', requireAdmin, backupController.downloadBackup);

// Backup sil
router.delete('/:fileName', requireAdmin, backupController.deleteBackup);

module.exports = router;