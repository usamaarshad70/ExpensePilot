const SavingsHistory = require("../models/SavingsHistory");

// ==========================================
// GET SAVINGS HISTORY
// ==========================================

const getSavingsHistory = async (req, res) => {
  try {
    const history = await SavingsHistory.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Get savings history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch savings history",
    });
  }
};

// ==========================================
// DELETE HISTORY ENTRY
// ==========================================

const deleteSavingsHistory = async (req, res) => {
  try {
    const history = await SavingsHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Savings history entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Savings history entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete savings history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete savings history entry",
    });
  }
};

module.exports = {
  getSavingsHistory,
  deleteSavingsHistory,
};
