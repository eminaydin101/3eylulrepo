const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { Buffer } = require('buffer');

// Yeni kullanıcı kaydı
exports.register = async (req, res) => {
    const { fullName, email, password, hint } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    if (password.length < 6) return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });

    try {
        const db = await getDb();
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO users (fullName, email, password, role, status, hint) VALUES (?, ?, ?, ?, ?, ?)',
            fullName, email, hashedPassword, 'User', 'Active', hint || ''
        );
        const newUser = await db.get('SELECT id, fullName, email, role, status FROM users WHERE id = ?', result.lastID);
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error("Kayıt hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });

    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (!user || !user.password || user.status !== 'Active') {
            return res.status(401).json({ message: 'Geçersiz kimlik bilgileri veya kullanıcı aktif değil.' });
        }

        let passwordMatch = false;
        // Şifrenin yeni (bcrypt) mi eski (Base64) mi olduğunu kontrol et
        if (user.password.startsWith('$2b$')) {
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            // Geriye uyumluluk için eski Base64 kontrolü
            const decodedPassword = Buffer.from(user.password, 'base64').toString('utf-8');
            passwordMatch = (password === decodedPassword);
        }

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Geçersiz kimlik bilgileri veya kullanıcı aktif değil.' });
        }

        const userPayload = { id: user.id, fullName: user.fullName, email: user.email, role: user.role, status: user.status };
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ user: userPayload, token });
    } catch (error) {
        console.error("Giriş hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};