const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users -> Tüm kullanıcıları listeler
router.get('/', userController.getAllUsers);

// POST /api/users -> Yeni bir kullanıcı oluşturur
router.post('/', userController.createUser);

// PUT /api/users/:id -> Belirtilen ID'li kullanıcıyı günceller
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id -> Belirtilen ID'li kullanıcıyı siler
router.delete('/:id', userController.deleteUser);

module.exports = router;