const express = require("express");
const {
    addAbsenteeism,
    getAbsenteeism,
    deleteAbsenteeism
} = require("../controllers/absenteeismController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware.verifyToken, addAbsenteeism); // Devamsızlık ekleme
router.get("/list", authMiddleware.verifyToken, getAbsenteeism);   // Devamsızlık listeleme
router.delete("/:id/delete", authMiddleware.verifyToken, deleteAbsenteeism); // Devamsızlık silme

module.exports = router;
