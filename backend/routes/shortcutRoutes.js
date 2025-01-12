// routes/shortcutRoutes.js
const express = require('express');
const router = express.Router();
const shortcutController = require('../controllers/shortcutController');
const authMiddleware = require('../middleware/authMiddleware'); // JWT doğrulama middleware'i

// Kısayol oluştur
router.post('/create', authMiddleware.verifyToken, shortcutController.createShortcut);

// Kısayolları getir
router.get('/', authMiddleware.verifyToken, shortcutController.getShortcuts);

// Kısayol sil
router.delete('/:id', authMiddleware.verifyToken, shortcutController.deleteShortcut);

module.exports = router;
