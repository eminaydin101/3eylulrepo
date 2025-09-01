const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// URL: POST /api/auth/register
router.post('/register', authController.register);

// URL: POST /api/auth/login
router.post('/login', authController.login);

// URL: POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// URL: POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// URL: POST /api/auth/verify-email
router.post('/verify-email', authController.verifyEmail);

module.exports = router;