const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Yetkilendirme reddedildi. Token bulunamadı.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // User bilgilerini req'e ekle - email bildirimleri için gerekli
        req.user = { 
            id: decoded.id, 
            role: decoded.role,
            name: decoded.name || 'Sistem' // Opsiyonel - JWT'ye name eklenebilir
        };
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: 'Token geçersiz.' });
    }
};