
const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAnnouncements,
    republishAnnouncement,
} = require('../controllers/announcementController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 1. Duyuru oluştur
router.post('/create', verifyToken, createAnnouncement);
// Admin ve departman kullanıcıları duyuru oluşturabilir

// 2. Duyuruları listele
router.get('/', verifyToken, getAnnouncements);
// Admin tüm duyuruları görebilir, departman kullanıcıları kendi departmanlarına gelen duyuruları görebilir

// 3. Admin tarafından departman duyurusunu tekrar yayınla
router.post('/republish', verifyToken, isAdmin, republishAnnouncement);
// Sadece admin, departman duyurusunu yeniden yayınlayabilir

module.exports = router;
