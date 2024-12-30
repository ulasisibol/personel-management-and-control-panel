const express = require('express');
const router = express.Router();
const { loginUser, addUser, listUsers, deleteUser } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', verifyToken, isAdmin, addUser);
router.get('/users', verifyToken, isAdmin, listUsers);
router.delete('/users/:userId', verifyToken, isAdmin, deleteUser);

module.exports = router;
