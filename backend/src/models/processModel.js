const { getDb, getMsgDb } = require('../config/database');

const getAll = async () => {
    const db = getDb();
    const processes = await db.all('SELECT * FROM processes');
    const responsibles = await db.all('SELECT * FROM process_responsibles');

    const responsiblesMap = responsibles.reduce((acc, r) => {
        if (!acc[r.processId]) {
            acc[r.processId] = [];
        }
        acc[r.processId].push(r.userFullName);
        return acc;
    }, {});

    return processes.map(p => ({
        ...p,
        sorumlular: responsiblesMap[p.id] || []
    }));
};

const getById = async (id) => {
    const db = getDb();
    const process = await db.get('SELECT * FROM processes WHERE id = ?', id);
    if (!process) return null;

    const responsibles = await db.all('SELECT userFullName FROM process_responsibles WHERE processId = ?', id);
    process.sorumlular = responsibles.map(r => r.userFullName);
    return process;
};

const create = async (processData) => {
    const db = getDb();
    const { sorumlular, ...processFields } = processData;
    const newId = `P${Date.now()}`;
    
    await db.run(
        `INSERT INTO processes (id, firma, konum, baslik, surec, mevcutDurum, baslangicTarihi, sonrakiKontrolTarihi, tamamlanmaTarihi, kategori, altKategori, oncelikDuzeyi, durum) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        newId, processFields.firma, processFields.konum, processFields.baslik, processFields.surec, processFields.mevcutDurum,
        processFields.baslangicTarihi, processFields.sonrakiKontrolTarihi, processFields.tamamlanmaTarihi, processFields.kategori,
        processFields.altKategori, processFields.oncelikDuzeyi, processFields.durum
    );

    if (sorumlular && sorumlular.length > 0) {
        const stmt = await db.prepare('INSERT INTO process_responsibles (processId, userFullName) VALUES (?, ?)');
        for (const userFullName of sorumlular) {
            await stmt.run(newId, userFullName);
        }
        await stmt.finalize();
    }
    return newId;
};

const update = async (id, processData) => {
    const db = getDb();
    const { sorumlular, ...processFields } = processData;

    await db.run(
        `UPDATE processes SET firma = ?, konum = ?, baslik = ?, surec = ?, mevcutDurum = ?, baslangicTarihi = ?, sonrakiKontrolTarihi = ?, 
         tamamlanmaTarihi = ?, kategori = ?, altKategori = ?, oncelikDuzeyi = ?, durum = ? WHERE id = ?`,
        processFields.firma, processFields.konum, processFields.baslik, processFields.surec, processFields.mevcutDurum,
        processFields.baslangicTarihi, processFields.sonrakiKontrolTarihi, processFields.tamamlanmaTarihi, processFields.kategori,
        processFields.altKategori, processFields.oncelikDuzeyi, processFields.durum, id
    );

    // Sorumluları güncelle: Önce sil, sonra ekle
    await db.run('DELETE FROM process_responsibles WHERE processId = ?', id);
    if (sorumlular && sorumlular.length > 0) {
        const stmt = await db.prepare('INSERT INTO process_responsibles (processId, userFullName) VALUES (?, ?)');
        for (const userFullName of sorumlular) {
            await stmt.run(id, userFullName);
        }
        await stmt.finalize();
    }
    return getById(id);
};

const deleteProcess = async (id) => {
    const db = getDb();
    return await db.run('DELETE FROM processes WHERE id = ?', id);
};

const getFirmsAndCategories = async () => {
    const db = getDb();
    const firms = await db.all('SELECT f.name as firmName, l.locationName FROM firms f LEFT JOIN locations l ON f.name = l.firmName');
    const categories = await db.all('SELECT c.name as categoryName, s.subcategoryName FROM categories c LEFT JOIN subcategories s ON c.name = s.categoryName');
    return [...firms, ...categories];
};

const getLogs = async () => {
    const db = getDb();
    return await db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50');
};

const getMessages = async () => {
    const msgDb = getMsgDb();
    return await msgDb.all("SELECT * FROM messages ORDER BY timestamp ASC");
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteProcess,
    getFirmsAndCategories,
    getLogs,
    getMessages
};
