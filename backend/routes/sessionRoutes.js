const express = require('express');
const { addSession } = require('../controllers/sessionController');
const router = express.Router();

router.post('/', addSession);

module.exports = router;