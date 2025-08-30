const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');

// URL: GET /api/processes/initial-data -> Tüm başlangıç verisini getirir
router.get('/initial-data', processController.getInitialData);

// URL: POST /api/processes -> Yeni bir süreç oluşturur
router.post('/', processController.createProcess);

// URL: PUT /api/processes/:id -> Belirtilen ID'li süreci günceller
router.put('/:id', processController.updateProcess);

// URL: DELETE /api/processes/:id -> Belirtilen ID'li süreci siler
router.delete('/:id', processController.deleteProcess);

module.exports = router;