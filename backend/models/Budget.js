const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },

    type: {
      type: String,
      enum: ["overall", "category"],
      required: true,
    },

    category: {
      type: String,
      trim: true,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// One overall budget per user per month
// One category budget per category per month
budgetSchema.index(
  {
    user: 1,
    month: 1,
    type: 1,
    category: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Budget", budgetSchema);
