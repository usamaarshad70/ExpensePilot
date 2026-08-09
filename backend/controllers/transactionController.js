const Transaction = require("../models/Transaction");

// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};

// ==========================================
// CREATE TRANSACTION
// ==========================================

const createTransaction = async (req, res) => {
  try {
    console.log("========== CREATE TRANSACTION ==========");
    console.log("User ID:", req.userId);
    console.log("Request body:", req.body);

    const { title, amount, type, category, date } = req.body;

    if (!title || amount === undefined || !type || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All transaction fields are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: new Date(date),
    });

    console.log("Transaction created:", transaction);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("========== CREATE TRANSACTION ERROR ==========");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("==============================================");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE TRANSACTION
// ==========================================

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const { title, amount, type, category, date } = req.body;

    if (title !== undefined) {
      transaction.title = title;
    }

    if (amount !== undefined) {
      transaction.amount = Number(amount);
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction type",
        });
      }

      transaction.type = type;
    }

    if (category !== undefined) {
      transaction.category = category;
    }

    if (date !== undefined) {
      transaction.date = date;
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
};

// ==========================================
// DELETE TRANSACTION
// ==========================================

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
