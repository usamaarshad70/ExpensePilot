const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

// All transaction routes require login

router.use(protect);

// GET all
router.get("/", getTransactions);

// CREATE
router.post("/", createTransaction);

// UPDATE
router.put("/:id", updateTransaction);

// DELETE
router.delete("/:id", deleteTransaction);

module.exports = router;
