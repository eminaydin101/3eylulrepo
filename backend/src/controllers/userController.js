const bcrypt = require('bcrypt');
const { getDb } = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        const db = await getDb();
        const users = await db.all('SELECT id, fullName, email, role, status FROM users');
        res.status(200).json(users);
    } catch (error) {
        console.error("Kullanıcılar alınırken hata:", error);
        res.status(500).json({ message: "Sunucu hatası: " + error.message });
    }
};

exports.createUser = async (req, res) => {
    const { fullName, email, password, role, status, hint } = req.body;
    
    if (!fullName || !email || !password || !role || !status) {
        return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }
    
    try {
        const db = await getDb();
        
        // Email kontrolü
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (fullName, email, password, role, status, hint, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            fullName, email, hashedPassword, role, status, hint || '', 1
        );
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
    } catch (error) {
        console.error("Kullanıcı oluşturma hatası:", error);
        res.status(500).json({ message: 'Kullanıcı oluşturma hatası: ' + error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role, status, password } = req.body;
    
    try {
        const db = await getDb();
        
        // Mevcut kullanıcıyı kontrol et
        const existingUser = await db.get('SELECT * FROM users WHERE id = ?', id);
        if (!existingUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        
        // Email kontrolü (kendi emaili değilse)
        if (email && email !== existingUser.email) {
            const emailInUse = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', email, id);
            if (emailInUse) {
                return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
            }
        }
        
        // Güncelleme parametrelerini hazırla
        const updateFields = [];
        const updateValues = [];
        
        if (fullName !== undefined) {
            updateFields.push('fullName = ?');
            updateValues.push(fullName);
        }
        
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        // Role sadece admin veya superadmin değiştirebilir
        if (role !== undefined && (req.user?.role === 'Admin' || req.user?.role === 'SuperAdmin')) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        
        // Status sadece admin veya superadmin değiştirebilir veya kullanıcı kendi profilini güncellerken status değişmez
        if (status !== undefined && (req.user?.role === 'Admin' || req.user?.role === 'SuperAdmin') && req.user?.id != id) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        
        // Password güncellemesi
        if (password && password.trim()) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Güncellenecek alan bulunamadı.' });
        }
        
        updateValues.push(id); // WHERE condition için
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.run(updateQuery, updateValues);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ message: 'Kullanıcı başarıyla güncellendi.' });
    } catch (error) {
        console.error("Kullanıcı güncelleme hatası:", error);
        res.status(500).json({ message: 'Kullanıcı güncelleme hatası: ' + error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    
    try {
        const db = await getDb();
        
        // Kullanıcıyı kontrol et
        const user = await db.get('SELECT * FROM users WHERE id = ?', id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        
        // Son SuperAdmin'i silme kontrolü
        if (user.role === 'SuperAdmin') {
            const superAdminCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "SuperAdmin"');
            if (superAdminCount.count <= 1) {
                return res.status(400).json({ message: 'Son SuperAdmin kullanıcısını silemezsiniz.' });
            }
        }
        
        // İlişkili verileri temizle
        await db.run('DELETE FROM process_assignments WHERE userId = ?', id);
        
        // Kullanıcıyı sil
        await db.run('DELETE FROM users WHERE id = ?', id);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
    } catch (error) {
        console.error("Kullanıcı silme hatası:", error);
        res.status(500).json({ message: 'Kullanıcı silme hatası: ' + error.message });
    }
};