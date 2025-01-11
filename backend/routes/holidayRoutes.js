const express = require("express");
const { getPersonnel, addHoliday, getHolidays, deleteHoliday } = require("../controllers/holidayController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Tatil yönetimi rotaları
router.post("/create", authMiddleware.verifyToken, addHoliday); // Tatil ekleme
router.get("/list", authMiddleware.verifyToken, getHolidays);  // Tatilleri listeleme
router.delete("/:id/delete", authMiddleware.verifyToken, deleteHoliday); // Tatil silme
router.get("/", authMiddleware.verifyToken, getPersonnel); // Personelleri listeleme

module.exports = router;
