const bcrypt = require('bcrypt');
const { getDb } = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        const db = await getDb();
        const users = await db.all('SELECT id, fullName, email, role, status FROM users');
        res.status(200).json(users);
    } catch (error) {
        console.error("Kullanıcılar alınırken hata:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

exports.createUser = async (req, res) => {
    const { fullName, email, password, role, status, hint } = req.body;
    if (!fullName || !email || !password || !role || !status) {
        return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }
    try {
        const db = await getDb();
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (fullName, email, password, role, status, hint) VALUES (?, ?, ?, ?, ?, ?)',
            fullName, email, hashedPassword, role, status, hint || ''
        );
        req.io.emit('data_changed'); // Arayüzü yenilemek için sinyal gönder
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
    } catch (error) {
        console.error("Kullanıcı oluşturma hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role, status, password } = req.body;
    try {
        const db = await getDb();
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run(
                'UPDATE users SET fullName = ?, email = ?, role = ?, status = ?, password = ? WHERE id = ?',
                fullName, email, role, status, hashedPassword, id
            );
        } else {
            await db.run(
                'UPDATE users SET fullName = ?, email = ?, role = ?, status = ? WHERE id = ?',
                fullName, email, role, status, id
            );
        }
        req.io.emit('data_changed');
        res.status(200).json({ message: 'Kullanıcı başarıyla güncellendi.' });
    } catch (error) {
        console.error("Kullanıcı güncelleme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDb();
        await db.run('DELETE FROM users WHERE id = ?', id);
        req.io.emit('data_changed');
        res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
    } catch (error) {
        console.error("Kullanıcı silme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};