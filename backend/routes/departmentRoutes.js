// departmentRoutes.js
const express = require('express');
const router = express.Router();
const {
    createDepartment,
    addManager,
    listDepartments,
    deleteDepartment
} = require('../controllers/departmentController');

router.post('/create', createDepartment);
router.post('/add/:departmentId/managers', addManager);
router.get('/list', listDepartments);
router.delete('/delete/:departmentId', deleteDepartment);

module.exports = router;
