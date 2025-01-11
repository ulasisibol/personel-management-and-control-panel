const express = require("express");
const router = express.Router();
const { createShift, getShifts, updateShift, removePersonnelFromShift, deleteShift, getAvailablePersonnel, assignPersonnelToShift, getAssignedShifts } = require("../controllers/shiftsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", createShift);

router.get("/", getShifts);

router.post('/:shiftId/assign', assignPersonnelToShift);

router.delete("/:shiftId/delete", deleteShift);

router.post('/:shiftId/remove-personnel', removePersonnelFromShift);

router.put("/:shiftId/update", updateShift);

router.get("/assigned", authMiddleware.verifyToken, getAssignedShifts);

router.get('/personnel', getAvailablePersonnel);

module.exports = router;
