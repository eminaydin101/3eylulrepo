const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../config/database');
const router = express.Router();

// Dosya yükleme klasörünü oluştur
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        
        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error('Desteklenmeyen dosya formatı'));
        }
    }
});

// Dosya yükleme endpoint'i
router.post('/upload/:processId', upload.array('files', 10), async (req, res) => {
    try {
        const { processId } = req.params;
        const db = await getDb();
        
        // Process var mı kontrol et
        const process = await db.get('SELECT * FROM processes WHERE id = ?', processId);
        if (!process) {
            return res.status(404).json({ message: 'Süreç bulunamadı' });
        }

        const fileRecords = [];
        for (const file of req.files) {
            const result = await db.run(
                'INSERT INTO process_files (processId, originalName, filename, path, size, mimetype, uploadedBy, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                processId, file.originalname, file.filename, file.path, file.size, file.mimetype, req.user?.id || 1, new Date().toISOString()
            );
            
            fileRecords.push({
                id: result.lastID,
                originalName: file.originalname,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype
            });
        }

        req.io.emit('data_changed');
        res.status(200).json({ 
            message: 'Dosyalar başarıyla yüklendi',
            files: fileRecords 
        });
    } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        res.status(500).json({ message: 'Dosya yükleme hatası' });
    }
});

// Süreçin dosyalarını listeleme
router.get('/:processId', async (req, res) => {
    try {
        const { processId } = req.params;
        const db = await getDb();
        
        const files = await db.all(
            'SELECT * FROM process_files WHERE processId = ? ORDER BY uploadedAt DESC',
            processId
        );
        
        res.status(200).json(files);
    } catch (error) {
        console.error('Dosya listeleme hatası:', error);
        res.status(500).json({ message: 'Dosya listeleme hatası' });
    }
});

// Dosya indirme
router.get('/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const db = await getDb();
        
        const file = await db.get('SELECT * FROM process_files WHERE id = ?', fileId);
        if (!file || !fs.existsSync(file.path)) {
            return res.status(404).json({ message: 'Dosya bulunamadı' });
        }
        
        res.download(file.path, file.originalName);
    } catch (error) {
        console.error('Dosya indirme hatası:', error);
        res.status(500).json({ message: 'Dosya indirme hatası' });
    }
});

// Dosya silme
router.delete('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const db = await getDb();
        
        const file = await db.get('SELECT * FROM process_files WHERE id = ?', fileId);
        if (!file) {
            return res.status(404).json({ message: 'Dosya bulunamadı' });
        }
        
        // Dosyayı diskten sil
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        // Veritabanından sil
        await db.run('DELETE FROM process_files WHERE id = ?', fileId);
        
        req.io.emit('data_changed');
        res.status(200).json({ message: 'Dosya başarıyla silindi' });
    } catch (error) {
        console.error('Dosya silme hatası:', error);
        res.status(500).json({ message: 'Dosya silme hatası' });
    }
});

module.exports = router;