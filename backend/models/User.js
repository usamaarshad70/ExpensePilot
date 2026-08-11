const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ==========================================
    // PROFILE PICTURE
    // ==========================================

    profilePicture: {
      type: String,
      default: "",
    },

    profilePicturePublicId: {
      type: String,
      default: "",
    },

    // ==========================================
    // PASSWORD RESET
    // ==========================================

    passwordResetCode: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
