const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  addContribution,
  deleteSavingsGoal,
} = require("../controllers/savingsGoalController");

const router = express.Router();

// ==========================================
// ALL SAVINGS GOAL ROUTES REQUIRE LOGIN
// ==========================================

router.use(protect);

// ==========================================
// GET ALL
// ==========================================

router.get("/", getSavingsGoals);

// ==========================================
// CREATE
// ==========================================

router.post("/", createSavingsGoal);

// ==========================================
// UPDATE
// ==========================================

router.put("/:id", updateSavingsGoal);

// ==========================================
// ADD CONTRIBUTION
// ==========================================

router.post("/:id/contribute", addContribution);

// ==========================================
// DELETE
// ==========================================

router.delete("/:id", deleteSavingsGoal);

module.exports = router;
