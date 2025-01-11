const express = require('express');
const router = express.Router();
const { handleNaturalQuery, getAIFormattedQueryResult } = require('../controllers/openaiController');

// Doğal dil sorguları için endpoint
router.post('/natural-query', handleNaturalQuery);
router.post('/execute-query', getAIFormattedQueryResult);

module.exports = router;
