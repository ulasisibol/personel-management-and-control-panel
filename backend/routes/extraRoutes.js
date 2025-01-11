const express = require("express");
const router = express.Router();
const { getPersonnel, createExtraWork, getExtraWork, deleteExtraWork, updateExtraWork } = require("../controllers/extraShiftController");
const authMiddleware = require("../middleware/authMiddleware");
// Ekstra Mesai Ekle
router.post("/create", createExtraWork);

// Ekstra Mesai Listele
router.get("/list", getExtraWork);

// Ekstra Mesai Sil
router.delete("/:id/delete", deleteExtraWork);

// Ekstra Mesai Güncelle
router.put("/:id/update", updateExtraWork);


router.get("/", authMiddleware.verifyToken, getPersonnel);


module.exports = router;
