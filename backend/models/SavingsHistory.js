const mongoose = require("mongoose");

const savingsHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingsGoal",
      default: null,
      index: true,
    },

    goalTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["initial", "contribution"],
      default: "contribution",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// USER + DATE INDEX
// ==========================================

savingsHistorySchema.index({
  user: 1,
  createdAt: -1,
});

// ==========================================
// USER + GOAL INDEX
// ==========================================

savingsHistorySchema.index({
  user: 1,
  goal: 1,
  createdAt: -1,
});

module.exports = mongoose.model("SavingsHistory", savingsHistorySchema);
