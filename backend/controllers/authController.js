const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// ==========================================
// GENERATE JWT
// ==========================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// ==========================================
// GENERATE 6 DIGIT RESET CODE
// ==========================================

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id);

    // Response
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating account",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// NO EMAIL
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate 6 digit code
    const code = generateCode();

    // Save reset code
    user.passwordResetCode = code;

    // Code expires after 10 minutes
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // DEVELOPMENT / NO EMAIL MODE
    return res.status(200).json({
      success: true,
      message: "Password reset code generated successfully",
      resetCode: code,
      expiresIn: 600,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate password reset code",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validation
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    // Check reset code exists
    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "Reset code is invalid or expired",
      });
    }

    // Check expiration
    if (new Date() > user.passwordResetExpires) {
      user.passwordResetCode = null;
      user.passwordResetExpires = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset code has expired",
      });
    }

    // Compare code
    if (user.passwordResetCode !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset code
    user.passwordResetCode = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      user.name = name.trim();
    }

    // Update email
    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: req.userId,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "This email is already in use",
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ==========================================
// UPLOAD PROFILE PICTURE
// ==========================================

const uploadProfilePicture = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // UPLOAD NEW IMAGE FIRST
    // ==========================================

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "expensepilot/profile-pictures",
          resource_type: "image",
          transformation: [
            {
              width: 300,
              height: 300,
              crop: "fill",
              gravity: "face",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    // ==========================================
    // SAVE OLD PICTURE INFORMATION
    // ==========================================

    const oldPublicId = user.profilePicturePublicId;

    // ==========================================
    // SAVE NEW PICTURE
    // ==========================================

    user.profilePicture = uploadResult.secure_url;

    user.profilePicturePublicId = uploadResult.public_id;

    await user.save();

    // ==========================================
    // DELETE OLD CLOUDINARY IMAGE
    // AFTER NEW IMAGE IS SAVED
    // ==========================================

    if (oldPublicId && oldPublicId !== uploadResult.public_id) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
        });

        console.log("Old profile picture deleted:", oldPublicId);
      } catch (deleteError) {
        console.error(
          "Old profile picture deletion error:",
          deleteError.message,
        );
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
    });
  }
};

// ==========================================
// REMOVE PROFILE PICTURE
// ==========================================

const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // DELETE IMAGE FROM CLOUDINARY
    // ==========================================

    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId, {
          resource_type: "image",
        });

        console.log(
          "Profile picture deleted from Cloudinary:",
          user.profilePicturePublicId,
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError.message);
      }
    }

    // ==========================================
    // CLEAR PROFILE PICTURE
    // ==========================================

    user.profilePicture = "";
    user.profilePicturePublicId = "";

    await user.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: "",
      },
    });
  } catch (error) {
    console.error("Remove profile picture error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove profile picture",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword,
};
