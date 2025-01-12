const express = require('express');
const router = express.Router();
const { handleNaturalQuery, deleteQuery, getAIFormattedQueryResult, getQueryById, saveQuery, getQueries } = require('../controllers/openaiController');
const authMiddleware = require("../middleware/authMiddleware");

// Doğal dil sorguları için endpoint
router.post('/natural-query', handleNaturalQuery);
router.post('/execute-query', getAIFormattedQueryResult);
router.post("/save", authMiddleware.verifyToken, saveQuery); // Sorgu kaydet
router.get("/list", authMiddleware.verifyToken, getQueries); // Sorguları getir
router.get('/query/:id', getQueryById);
router.delete("/query/:id", deleteQuery);

module.exports = router;
