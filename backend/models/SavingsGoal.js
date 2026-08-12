const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// USER + TITLE INDEX
// ==========================================

savingsGoalSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
