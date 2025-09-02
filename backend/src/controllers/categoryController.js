const fs = require('fs').promises;
const path = require('path');

// Kategori ve firma verilerinin tutulacağı dosyalar
const CATEGORIES_FILE = path.join(__dirname, '../../data/categories.json');
const COMPANIES_FILE = path.join(__dirname, '../../data/companies.json');

// Varsayılan veriler
const DEFAULT_CATEGORIES = {
    "Yazılım": ["Web Geliştirme", "Mobil Geliştirme", "Veritabanı Yönetimi"],
    "Finans": ["Muhasebe", "Bütçe", "Denetim"],
    "BT": ["Altyapı", "Siber Güvenlik", "Donanım"],
    "Yönetim": ["İnsan Kaynakları", "Operasyon", "Pazarlama"]
};

const DEFAULT_COMPANIES = {
    "Sera": ["Merkez", "Van", "Teknopark"],
    "Van": ["Bil", "İn", "Endüstri"],
    "Mik": ["Bos", "Ad", "Çarşı"],
    "Alfa": ["İstanbul", "Ankara"]
};

// Data klasörü oluştur
const ensureDataDir = async () => {
    const dataDir = path.join(__dirname, '../../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
};

// Dosya okuma helper
const readJsonFile = async (filePath, defaultData) => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Dosya yoksa varsayılan veriyi oluştur
        await writeJsonFile(filePath, defaultData);
        return defaultData;
    }
};

// Dosya yazma helper
const writeJsonFile = async (filePath, data) => {
    try {
        await ensureDataDir();
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        throw new Error('Dosya yazılamadı: ' + error.message);
    }
};

// Kategoriler için CRUD işlemleri
exports.getCategories = async (req, res) => {
    try {
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        res.status(200).json(categories);
    } catch (error) {
        console.error('Kategoriler alınırken hata:', error);
        res.status(500).json({ message: 'Kategoriler alınamadı: ' + error.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Kategori adı gereklidir' });
        }
        
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        
        if (categories[name]) {
            return res.status(409).json({ message: 'Bu kategori zaten mevcut' });
        }
        
        categories[name] = [];
        await writeJsonFile(CATEGORIES_FILE, categories);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(201).json({ 
            message: 'Kategori başarıyla eklendi',
            categories 
        });
    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        res.status(500).json({ message: 'Kategori eklenemedi: ' + error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { oldName } = req.params;
        const { newName } = req.body;
        
        if (!newName || newName.trim() === '') {
            return res.status(400).json({ message: 'Yeni kategori adı gereklidir' });
        }
        
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        
        if (!categories[oldName]) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        
        if (oldName !== newName && categories[newName]) {
            return res.status(409).json({ message: 'Bu kategori adı zaten kullanılıyor' });
        }
        
        if (oldName !== newName) {
            categories[newName] = categories[oldName];
            delete categories[oldName];
        }
        
        await writeJsonFile(CATEGORIES_FILE, categories);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Kategori başarıyla güncellendi',
            categories 
        });
    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        res.status(500).json({ message: 'Kategori güncellenemedi: ' + error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { name } = req.params;
        
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        
        if (!categories[name]) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        
        delete categories[name];
        await writeJsonFile(CATEGORIES_FILE, categories);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Kategori başarıyla silindi',
            categories 
        });
    } catch (error) {
        console.error('Kategori silme hatası:', error);
        res.status(500).json({ message: 'Kategori silinemedi: ' + error.message });
    }
};

// Alt kategoriler için işlemler
exports.addSubCategory = async (req, res) => {
    try {
        const { category, subCategory } = req.body;
        
        if (!category || !subCategory || category.trim() === '' || subCategory.trim() === '') {
            return res.status(400).json({ message: 'Kategori ve alt kategori adı gereklidir' });
        }
        
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        
        if (!categories[category]) {
            return res.status(404).json({ message: 'Ana kategori bulunamadı' });
        }
        
        if (categories[category].includes(subCategory)) {
            return res.status(409).json({ message: 'Bu alt kategori zaten mevcut' });
        }
        
        categories[category].push(subCategory);
        await writeJsonFile(CATEGORIES_FILE, categories);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(201).json({ 
            message: 'Alt kategori başarıyla eklendi',
            categories 
        });
    } catch (error) {
        console.error('Alt kategori ekleme hatası:', error);
        res.status(500).json({ message: 'Alt kategori eklenemedi: ' + error.message });
    }
};

exports.updateSubCategory = async (req, res) => {
    try {
        const { category, oldSubCategory, newSubCategory } = req.body;
        
        if (!category || !oldSubCategory || !newSubCategory) {
            return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
        }
        
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        
        if (!categories[category]) {
            return res.status(404).json({ message: 'Ana kategori bulunamadı' });
        }
        
        const index = categories[category].indexOf(oldSubCategory);
        if (index === -1) {
            return res.status(404).json({ message: 'Alt kategori bulunamadı' });
        }
        
        if (oldSubCategory !== newSubCategory && categories[category].includes(newSubCategory)) {
            return res.status(409).json({ message: 'Bu alt kategori adı zaten kullanılıyor' });
        }
        
        categories[category][index] = newSubCategory;
        await writeJsonFile(CATEGORIES_FILE, categories);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Alt kategori başarıyla güncellendi',
            categories 
        });
    } catch (error) {
        console.error('Alt kategori güncelleme hatası:', error);
        res.status(500).json({ message: 'Alt kategori güncellenemedi: ' + error.message });
    }
};

exports.deleteSubCategory = async (req, res) => {
    try {
        const { category, subCategory } = req.body;
        
        if (!category || !subCategory) {
            return res.status(400).json({ message: 'Kategori ve alt kategori adı gereklidir' });
        }
        
        const categories = await readJsonFile(CATEGORIES_FILE, DEFAULT_CATEGORIES);
        
        if (!categories[category]) {
            return res.status(404).json({ message: 'Ana kategori bulunamadı' });
        }
        
        const index = categories[category].indexOf(subCategory);
        if (index === -1) {
            return res.status(404).json({ message: 'Alt kategori bulunamadı' });
        }
        
        categories[category].splice(index, 1);
        await writeJsonFile(CATEGORIES_FILE, categories);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Alt kategori başarıyla silindi',
            categories 
        });
    } catch (error) {
        console.error('Alt kategori silme hatası:', error);
        res.status(500).json({ message: 'Alt kategori silinemedi: ' + error.message });
    }
};

// Firmalar için CRUD işlemleri
exports.getCompanies = async (req, res) => {
    try {
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        res.status(200).json(companies);
    } catch (error) {
        console.error('Firmalar alınırken hata:', error);
        res.status(500).json({ message: 'Firmalar alınamadı: ' + error.message });
    }
};

exports.addCompany = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Firma adı gereklidir' });
        }
        
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        
        if (companies[name]) {
            return res.status(409).json({ message: 'Bu firma zaten mevcut' });
        }
        
        companies[name] = [];
        await writeJsonFile(COMPANIES_FILE, companies);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(201).json({ 
            message: 'Firma başarıyla eklendi',
            companies 
        });
    } catch (error) {
        console.error('Firma ekleme hatası:', error);
        res.status(500).json({ message: 'Firma eklenemedi: ' + error.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { oldName } = req.params;
        const { newName } = req.body;
        
        if (!newName || newName.trim() === '') {
            return res.status(400).json({ message: 'Yeni firma adı gereklidir' });
        }
        
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        
        if (!companies[oldName]) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        
        if (oldName !== newName && companies[newName]) {
            return res.status(409).json({ message: 'Bu firma adı zaten kullanılıyor' });
        }
        
        if (oldName !== newName) {
            companies[newName] = companies[oldName];
            delete companies[oldName];
        }
        
        await writeJsonFile(COMPANIES_FILE, companies);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Firma başarıyla güncellendi',
            companies 
        });
    } catch (error) {
        console.error('Firma güncelleme hatası:', error);
        res.status(500).json({ message: 'Firma güncellenemedi: ' + error.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { name } = req.params;
        
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        
        if (!companies[name]) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        
        delete companies[name];
        await writeJsonFile(COMPANIES_FILE, companies);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Firma başarıyla silindi',
            companies 
        });
    } catch (error) {
        console.error('Firma silme hatası:', error);
        res.status(500).json({ message: 'Firma silinemedi: ' + error.message });
    }
};

// Lokasyonlar için işlemler
exports.addLocation = async (req, res) => {
    try {
        const { company, location } = req.body;
        
        if (!company || !location || company.trim() === '' || location.trim() === '') {
            return res.status(400).json({ message: 'Firma ve lokasyon adı gereklidir' });
        }
        
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        
        if (!companies[company]) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        
        if (companies[company].includes(location)) {
            return res.status(409).json({ message: 'Bu lokasyon zaten mevcut' });
        }
        
        companies[company].push(location);
        await writeJsonFile(COMPANIES_FILE, companies);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(201).json({ 
            message: 'Lokasyon başarıyla eklendi',
            companies 
        });
    } catch (error) {
        console.error('Lokasyon ekleme hatası:', error);
        res.status(500).json({ message: 'Lokasyon eklenemedi: ' + error.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { company, oldLocation, newLocation } = req.body;
        
        if (!company || !oldLocation || !newLocation) {
            return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
        }
        
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        
        if (!companies[company]) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        
        const index = companies[company].indexOf(oldLocation);
        if (index === -1) {
            return res.status(404).json({ message: 'Lokasyon bulunamadı' });
        }
        
        if (oldLocation !== newLocation && companies[company].includes(newLocation)) {
            return res.status(409).json({ message: 'Bu lokasyon adı zaten kullanılıyor' });
        }
        
        companies[company][index] = newLocation;
        await writeJsonFile(COMPANIES_FILE, companies);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Lokasyon başarıyla güncellendi',
            companies 
        });
    } catch (error) {
        console.error('Lokasyon güncelleme hatası:', error);
        res.status(500).json({ message: 'Lokasyon güncellenemedi: ' + error.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { company, location } = req.body;
        
        if (!company || !location) {
            return res.status(400).json({ message: 'Firma ve lokasyon adı gereklidir' });
        }
        
        const companies = await readJsonFile(COMPANIES_FILE, DEFAULT_COMPANIES);
        
        if (!companies[company]) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        
        const index = companies[company].indexOf(location);
        if (index === -1) {
            return res.status(404).json({ message: 'Lokasyon bulunamadı' });
        }
        
        companies[company].splice(index, 1);
        await writeJsonFile(COMPANIES_FILE, companies);
        
        if (req.io) {
            req.io.emit('data_changed');
        }
        
        res.status(200).json({ 
            message: 'Lokasyon başarıyla silindi',
            companies 
        });
    } catch (error) {
        console.error('Lokasyon silme hatası:', error);
        res.status(500).json({ message: 'Lokasyon silinemedi: ' + error.message });
    }
};