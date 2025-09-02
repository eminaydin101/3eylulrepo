const express = require('express');
const router = express.Router();

// Controller imports
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const processController = require('../controllers/processController');
const categoryController = require('../controllers/categoryController');
const systemSettingsController = require('../controllers/systemSettingsController');
const backupController = require('../controllers/backupController');

// Middleware imports
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', auth, authController.logout);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/verify-email/:token', authController.verifyEmail);

// User routes
router.get('/users', auth, adminAuth, userController.getAllUsers);
router.post('/users', auth, adminAuth, userController.createUser);
router.put('/users/:id', auth, userController.updateUser);
router.delete('/users/:id', auth, adminAuth, userController.deleteUser);

// Process routes
router.get('/processes/initial-data', auth, processController.getInitialData);
router.post('/processes', auth, processController.createProcess);
router.put('/processes/:id', auth, processController.updateProcess);
router.delete('/processes/:id', auth, processController.deleteProcess);

// Category routes
router.get('/categories', auth, categoryController.getCategories);
router.post('/categories', auth, adminAuth, categoryController.addCategory);
router.put('/categories/:oldName', auth, adminAuth, categoryController.updateCategory);
router.delete('/categories/:name', auth, adminAuth, categoryController.deleteCategory);

// Sub-category routes
router.post('/categories/sub', auth, adminAuth, categoryController.addSubCategory);
router.put('/categories/sub', auth, adminAuth, categoryController.updateSubCategory);
router.delete('/categories/sub', auth, adminAuth, categoryController.deleteSubCategory);

// Company routes
router.get('/companies', auth, categoryController.getCompanies);
router.post('/companies', auth, adminAuth, categoryController.addCompany);
router.put('/companies/:oldName', auth, adminAuth, categoryController.updateCompany);
router.delete('/companies/:name', auth, adminAuth, categoryController.deleteCompany);

// Location routes
router.post('/companies/location', auth, adminAuth, categoryController.addLocation);
router.put('/companies/location', auth, adminAuth, categoryController.updateLocation);
router.delete('/companies/location', auth, adminAuth, categoryController.deleteLocation);

// System settings routes
router.get('/system/settings', auth, systemSettingsController.getSystemSettings);
router.put('/system/settings', auth, adminAuth, systemSettingsController.updateSystemSettings);
router.post('/system/settings/logo', auth, adminAuth, systemSettingsController.uploadLogoMiddleware, systemSettingsController.uploadLogo);
router.delete('/system/settings/logo', auth, adminAuth, systemSettingsController.deleteLogo);
router.post('/system/settings/test-email', auth, adminAuth, systemSettingsController.testEmailSettings);
router.get('/system/status', auth, adminAuth, systemSettingsController.getSystemStatus);
router.post('/system/optimize', auth, adminAuth, systemSettingsController.optimizeDatabase);
router.post('/system/reset-defaults', auth, adminAuth, systemSettingsController.resetToDefaults);

// Backup routes (eğer yoksa ekleyin)
router.get('/backup', auth, adminAuth, backupController.getBackups);
router.post('/backup/database', auth, adminAuth, backupController.createDatabaseBackup);
router.post('/backup/import', auth, adminAuth, backupController.uploadBackup, backupController.importBackup);
router.get('/backup/download/:fileName', auth, adminAuth, backupController.downloadBackup);
router.delete('/backup/:fileName', auth, adminAuth, backupController.deleteBackup);
router.post('/backup/clean-temp', auth, adminAuth, backupController.cleanTempFiles);
router.post('/backup/system-report', auth, adminAuth, backupController.generateSystemReport);
router.post('/backup/clear-logs', auth, adminAuth, backupController.clearAllLogs);
router.post('/backup/factory-reset', auth, adminAuth, backupController.factoryReset);

module.exports = router;