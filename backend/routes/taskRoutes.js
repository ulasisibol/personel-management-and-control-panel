// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

// Yeni görev oluşturma
router.post('/create', taskController.createTask);

// Görevi tamamla -> awaiting_approval
router.post('/pending', taskController.completeTask);

// Admin onayı
router.post('/approve', taskController.approveTask);

// Admin red
router.post('/reject', taskController.rejectTask);

// Not ekleme (URL param: :taskId)
router.post('/:taskId/notes', taskController.addNote);

// Tüm görevleri listele (ID param yok)
router.get('/', verifyToken, taskController.listTasks);

// Tekil görev (URL param: :id)
router.get('/:id', taskController.getTaskById);

router.get('/pending/list', taskController.listPendingTasks);

module.exports = router;
