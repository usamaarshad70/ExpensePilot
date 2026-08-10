const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// ==========================================
// PROTECTED AUTH ROUTES
// ==========================================

// Current user
router.get("/me", authMiddleware, getMe);

// Update profile
router.put("/profile", authMiddleware, updateProfile);

// ==========================================
// PROFILE PICTURE
// ==========================================

// Upload profile picture
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture,
);

// Remove profile picture
router.delete("/profile-picture", authMiddleware, removeProfilePicture);

// ==========================================
// PASSWORD
// ==========================================

// Change password
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
