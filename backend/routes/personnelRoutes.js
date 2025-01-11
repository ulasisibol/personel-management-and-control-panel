// routes/personnelRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
    addPersonnel,
    deletePersonnel,
    updatePersonnel,
    listPersonnel
} = require('../controllers/personnelController');

// Multer memoryStorage ayarı
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Personel ekleme (fotoğraf dahil)
router.post('/add', verifyToken, upload.single('photo'), addPersonnel);

// Personel silme
router.delete('/delete/:personnel_id', verifyToken, deletePersonnel);

// Personel güncelleme
router.put('/update/:personnel_id', verifyToken, updatePersonnel);

// Tüm personeli listeleme
router.get('/', verifyToken, listPersonnel);

module.exports = router;
