const express = require('express');
const router = express.Router();
const { loginUser, addUser, listUsers, deleteUser, updateUser } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', verifyToken, isAdmin, addUser);
router.get('/users', verifyToken, isAdmin, listUsers);
router.delete('/users/:userId', verifyToken, isAdmin, deleteUser);
router.put('/users/update/:userId', verifyToken, updateUser, deleteUser);


module.exports = router;
