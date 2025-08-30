const { getDb } = require('../config/database');

const findByEmail = async (email) => {
    const db = getDb();
    return await db.get('SELECT * FROM users WHERE email = ?', email);
};

const findById = async (id) => {
    const db = getDb();
    return await db.get('SELECT id, fullName, email, role, status FROM users WHERE id = ?', id);
};

const getAll = async () => {
    const db = getDb();
    // Parola olmadan tüm kullanıcıları döndür
    return await db.all('SELECT id, fullName, email, role, status FROM users');
};

const create = async (user) => {
    const db = getDb();
    const { fullName, email, password, role, status, hint } = user;
    const result = await db.run(
        'INSERT INTO users (fullName, email, password, role, status, hint) VALUES (?, ?, ?, ?, ?, ?)',
        fullName, email, password, role, status, hint
    );
    return { id: result.lastID, ...user };
};

// Update ve Delete fonksiyonları da buraya eklenebilir.

module.exports = {
    findByEmail,
    findById,
    getAll,
    create,
};
