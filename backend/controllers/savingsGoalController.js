const SavingsGoal = require("../models/SavingsGoal");

// ==========================================
// GET ALL SAVINGS GOALS
// ==========================================

const getSavingsGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error("Get savings goals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch savings goals",
    });
  }
};

// ==========================================
// CREATE SAVINGS GOAL
// ==========================================

const createSavingsGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal title is required",
      });
    }

    if (targetAmount === undefined || Number(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than zero",
      });
    }

    const target = Number(targetAmount);
    const saved = Number(currentAmount || 0);

    if (saved < 0) {
      return res.status(400).json({
        success: false,
        message: "Saved amount cannot be negative",
      });
    }

    if (saved > target) {
      return res.status(400).json({
        success: false,
        message: "Saved amount cannot be greater than target amount",
      });
    }

    let parsedDeadline = null;

    if (deadline) {
      parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }
    }

    // ==========================================
    // CREATE
    // ==========================================

    const goal = await SavingsGoal.create({
      user: req.userId,
      title: title.trim(),
      targetAmount: target,
      currentAmount: saved,
      deadline: parsedDeadline,
    });

    return res.status(201).json({
      success: true,
      message: "Savings goal created successfully",
      goal,
    });
  } catch (error) {
    console.error("Create savings goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create savings goal",
    });
  }
};

// ==========================================
// UPDATE SAVINGS GOAL
// ==========================================

const updateSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    const { title, targetAmount, currentAmount, deadline } = req.body;

    // ==========================================
    // TITLE
    // ==========================================

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Goal title cannot be empty",
        });
      }

      goal.title = title.trim();
    }

    // ==========================================
    // TARGET
    // ==========================================

    if (targetAmount !== undefined) {
      if (Number(targetAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Target amount must be greater than zero",
        });
      }

      goal.targetAmount = Number(targetAmount);
    }

    // ==========================================
    // CURRENT AMOUNT
    // ==========================================

    if (currentAmount !== undefined) {
      if (Number(currentAmount) < 0) {
        return res.status(400).json({
          success: false,
          message: "Saved amount cannot be negative",
        });
      }

      goal.currentAmount = Number(currentAmount);
    }

    // ==========================================
    // DEADLINE
    // ==========================================

    if (deadline !== undefined) {
      if (!deadline) {
        goal.deadline = null;
      } else {
        const parsedDeadline = new Date(deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid deadline",
          });
        }

        goal.deadline = parsedDeadline;
      }
    }

    // ==========================================
    // FINAL VALIDATION
    // ==========================================

    if (goal.currentAmount > goal.targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Saved amount cannot be greater than target amount",
      });
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      message: "Savings goal updated successfully",
      goal,
    });
  } catch (error) {
    console.error("Update savings goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update savings goal",
    });
  }
};

// ==========================================
// ADD CONTRIBUTION
// ==========================================

const addContribution = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    const { amount } = req.body;

    if (amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Contribution amount must be greater than zero",
      });
    }

    const contribution = Number(amount);

    const newAmount = goal.currentAmount + contribution;

    if (newAmount > goal.targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Contribution exceeds the remaining goal amount",
      });
    }

    goal.currentAmount = newAmount;

    await goal.save();

    return res.status(200).json({
      success: true,
      message: "Contribution added successfully",
      goal,
    });
  } catch (error) {
    console.error("Add contribution error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add contribution",
    });
  }
};

// ==========================================
// DELETE SAVINGS GOAL
// ==========================================

const deleteSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Savings goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete savings goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete savings goal",
    });
  }
};

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  addContribution,
  deleteSavingsGoal,
};
