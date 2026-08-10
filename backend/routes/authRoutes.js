const express = require("express");

const {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  uploadProfilePicture,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register
router.post("/register", registerUser);

// Verify email
router.post("/verify-email", verifyEmail);

// Resend verification code
router.post("/resend-verification", resendVerificationCode);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// Current user
router.get("/me", authMiddleware, getMe);

// Update profile
router.put("/profile", authMiddleware, updateProfile);

// Upload profile picture
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture,
);

// Change password
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
