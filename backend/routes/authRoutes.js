const express = require("express");

const {
  registerUser,
  loginUser,
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

// Login
router.post("/login", loginUser);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// Get current logged-in user
router.get("/me", authMiddleware, getMe);

// Update name/email
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
