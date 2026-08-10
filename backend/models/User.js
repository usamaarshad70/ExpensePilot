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
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ==========================================
    // PROFILE PICTURE
    // ==========================================

    profilePicture: {
      type: String,
      default: "",
    },

    // Cloudinary public ID
    // Used to delete/replace the image properly
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
