const express = require('express');
const router = express.Router();
const { loginUser, addUser } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', verifyToken, isAdmin, addUser);

module.exports = router;
