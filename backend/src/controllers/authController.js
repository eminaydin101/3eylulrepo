const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDb } = require('../config/database');
const { Buffer } = require('buffer');
const { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

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
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const result = await db.run(
            'INSERT INTO users (fullName, email, password, role, status, hint, emailVerified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            fullName, email, hashedPassword, 'Viewer', 'Pending', hint || '', 0, verificationToken
        );
        
        const newUser = await db.get('SELECT id, fullName, email, role, status, emailVerified FROM users WHERE id = ?', result.lastID);
        
        // Hoş geldin emaili gönder
        try {
            await sendWelcomeEmail(email, fullName, verificationToken);
        } catch (emailError) {
            console.error('Hoş geldin emaili gönderilemedi:', emailError);
        }

        const token = jwt.sign({ 
            id: newUser.id, 
            role: newUser.role, 
            name: newUser.fullName 
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

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
            return res.status(401).json({ message: 'Geçersiz kimlik bilgileri.' });
        }

        const userPayload = { 
            id: user.id, 
            fullName: user.fullName, 
            email: user.email, 
            role: user.role, 
            status: user.status,
            emailVerified: user.emailVerified 
        };
        
        const token = jwt.sign({ 
            id: user.id, 
            role: user.role, 
            name: user.fullName 
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ user: userPayload, token });
    } catch (error) {
        console.error("Giriş hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Şifre sıfırlama isteği
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'E-posta adresi zorunludur.' });

    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (!user) {
            // Güvenlik için her durumda başarılı mesaj göster
            return res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        await db.run(
            'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
            resetToken, resetExpires.toISOString(), user.id
        );

        try {
            await sendPasswordResetEmail(email, user.fullName, resetToken);
        } catch (emailError) {
            console.error('Şifre sıfırlama emaili gönderilemedi:', emailError);
            return res.status(500).json({ message: 'Email gönderilirken hata oluştu.' });
        }

        res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
    } catch (error) {
        console.error("Şifre sıfırlama isteği hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Şifre sıfırlama
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token ve yeni şifre zorunludur.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });

    try {
        const db = await getDb();
        const user = await db.get(
            'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
            token, new Date().toISOString()
        );

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.run(
            'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
            hashedPassword, user.id
        );

        res.status(200).json({ message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Email doğrulama
exports.verifyEmail = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Doğrulama token\'ı zorunludur.' });

    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE verificationToken = ?', token);

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz doğrulama token\'ı.' });
        }

        await db.run(
            'UPDATE users SET emailVerified = 1, verificationToken = NULL, status = ? WHERE id = ?',
            'Active', user.id
        );

        res.status(200).json({ message: 'E-posta adresiniz başarıyla doğrulandı.' });
    } catch (error) {
        console.error("Email doğrulama hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};