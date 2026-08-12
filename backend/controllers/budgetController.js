const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// ==========================================
// GET BUDGETS
// ==========================================

const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;

    const filter = {
      user: req.userId,
    };

    if (month) {
      filter.month = month;
    }

    const budgets = await Budget.find(filter).sort({
      type: 1,
      category: 1,
    });

    return res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
    });
  }
};

// ==========================================
// CREATE BUDGET
// ==========================================

const createBudget = async (req, res) => {
  try {
    const { month, type, category, amount } = req.body;

    if (!month || !type || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Month, type and amount are required",
      });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format",
      });
    }

    if (!["overall", "category"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget type",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget amount must be greater than zero",
      });
    }

    if (type === "category" && !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required for category budget",
      });
    }

    const existingBudget = await Budget.findOne({
      user: req.userId,
      month,
      type,
      category: type === "category" ? category.trim() : null,
    });

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this selection",
      });
    }

    const budget = await Budget.create({
      user: req.userId,
      month,
      type,
      category: type === "category" ? category.trim() : null,
      amount: Number(amount),
    });

    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this selection",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create budget",
    });
  }
};

// ==========================================
// UPDATE BUDGET
// ==========================================

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const { amount } = req.body;

    if (amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid budget amount is required",
      });
    }

    budget.amount = Number(amount);

    await budget.save();

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update budget",
    });
  }
};

// ==========================================
// DELETE BUDGET
// ==========================================

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete budget",
    });
  }
};

// ==========================================
// GET BUDGET SUMMARY
// ==========================================

const getBudgetSummary = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Valid month is required",
      });
    }

    const budgets = await Budget.find({
      user: req.userId,
      month,
    }).sort({
      type: 1,
      category: 1,
    });

    const [year, monthNumber] = month.split("-").map(Number);

    const startDate = new Date(year, monthNumber - 1, 1);

    const endDate = new Date(year, monthNumber, 1);

    const transactions = await Transaction.find({
      user: req.userId,
      type: "expense",
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const totalSpent = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0,
    );

    const overallBudget = budgets.find((budget) => budget.type === "overall");

    const categoryBudgets = budgets.filter(
      (budget) => budget.type === "category",
    );

    const categorySummary = categoryBudgets.map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.category?.toLowerCase() ===
            budget.category?.toLowerCase(),
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

      const remaining = Number(budget.amount) - spent;

      const percentage =
        Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentage,
        overBudget: spent > Number(budget.amount),
      };
    });

    let overallSummary = null;

    if (overallBudget) {
      const remaining = Number(overallBudget.amount) - totalSpent;

      const percentage =
        Number(overallBudget.amount) > 0
          ? (totalSpent / Number(overallBudget.amount)) * 100
          : 0;

      overallSummary = {
        ...overallBudget.toObject(),
        spent: totalSpent,
        remaining,
        percentage,
        overBudget: totalSpent > Number(overallBudget.amount),
      };
    }

    return res.status(200).json({
      success: true,
      month,
      totalSpent,
      overall: overallSummary,
      categories: categorySummary,
    });
  } catch (error) {
    console.error("Get budget summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch budget summary",
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
};
