const express = require("express");
const router = express.Router();
const { createShift, getShifts, updateShift, removePersonnelFromShift, deleteShift, getAvailablePersonnel, assignPersonnelToShift, getAssignedShifts } = require("../controllers/shiftsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware.verifyToken, createShift);

router.get("/", authMiddleware.verifyToken, getShifts);

router.post('/:shiftId/assign', authMiddleware.verifyToken, assignPersonnelToShift);

router.delete("/:shiftId/delete", authMiddleware.verifyToken, deleteShift);

router.post('/:shiftId/remove-personnel', authMiddleware.verifyToken, removePersonnelFromShift);

router.put("/:shiftId/update", authMiddleware.verifyToken, updateShift);

router.get("/assigned", authMiddleware.verifyToken, getAssignedShifts);

router.get('/personnel', getAvailablePersonnel);

module.exports = router;
