const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} = require("../controllers/budgetController");

const router = express.Router();

// All budget routes require authentication
router.use(protect);

// Get budgets
router.get("/", getBudgets);

// Get calculated budget summary
router.get("/summary", getBudgetSummary);

// Create budget
router.post("/", createBudget);

// Update budget
router.put("/:id", updateBudget);

// Delete budget
router.delete("/:id", deleteBudget);

module.exports = router;
