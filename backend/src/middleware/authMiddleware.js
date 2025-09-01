const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Yetkilendirme reddedildi. Token bulunamadı.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // DÜZELTME: req.user'a doğru şekilde decoded verisini atıyoruz
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: 'Token geçersiz.' });
    }
};