const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getSavingsHistory,
  deleteSavingsHistory,
} = require("../controllers/savingsHistoryController");

const router = express.Router();

// ==========================================
// ALL ROUTES REQUIRE LOGIN
// ==========================================

router.use(protect);

// ==========================================
// GET HISTORY
// ==========================================

router.get("/", getSavingsHistory);

// ==========================================
// DELETE HISTORY ENTRY
// ==========================================

router.delete("/:id", deleteSavingsHistory);

module.exports = router;
