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
// PASSWORD VALIDATION
// ==========================================

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};

// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 100 characters",
      });
    }

    // ------------------------------------------
    // EMAIL VALIDATION
    // ------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // ------------------------------------------
    // PASSWORD VALIDATION
    // ------------------------------------------

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // ------------------------------------------
    // CHECK EXISTING USER
    // ------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // ------------------------------------------
    // HASH PASSWORD
    // ------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // ------------------------------------------
    // CREATE USER
    // ------------------------------------------

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // ------------------------------------------
    // GENERATE TOKEN
    // ------------------------------------------

    const token = generateToken(user._id);

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

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

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ------------------------------------------
    // FIND USER
    // ------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ------------------------------------------
    // ACCOUNT STATUS
    // ------------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // ------------------------------------------
    // COMPARE PASSWORD
    // ------------------------------------------

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ------------------------------------------
    // GENERATE TOKEN
    // ------------------------------------------

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
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // ------------------------------------------
    // GENERATE RESET CODE
    // ------------------------------------------

    const code = generateCode();

    user.passwordResetCode = code;

    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // ------------------------------------------
    // DEVELOPMENT MODE
    // ------------------------------------------

    const isDevelopmentResetMode =
      process.env.PASSWORD_RESET_DEV_MODE === "true";

    if (isDevelopmentResetMode) {
      console.log(`Password reset code for ${normalizedEmail}: ${code}`);

      return res.status(200).json({
        success: true,
        message: "Password reset code generated successfully",
        resetCode: code,
        expiresIn: 600,
      });
    }

    // ------------------------------------------
    // PRODUCTION MODE
    // ------------------------------------------

    // Later we will send this code through email.
    // NEVER expose the reset code in production.

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code and new password are required",
      });
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError.replace("Password", "New password"),
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    // ------------------------------------------
    // CHECK CODE
    // ------------------------------------------

    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "Reset code is invalid or expired",
      });
    }

    // ------------------------------------------
    // CHECK EXPIRATION
    // ------------------------------------------

    if (new Date() > user.passwordResetExpires) {
      user.passwordResetCode = null;
      user.passwordResetExpires = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset code has expired",
      });
    }

    // ------------------------------------------
    // COMPARE CODE
    // ------------------------------------------

    if (user.passwordResetCode !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    // ------------------------------------------
    // UPDATE PASSWORD
    // ------------------------------------------

    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset information

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
    const user = await User.findById(req.userId).select(
      "-password -passwordResetCode -passwordResetExpires",
    );

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

    // ------------------------------------------
    // UPDATE NAME
    // ------------------------------------------

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      if (trimmedName.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 100 characters",
        });
      }

      user.name = trimmedName;
    }

    // ------------------------------------------
    // UPDATE EMAIL
    // ------------------------------------------

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------
    // FILE TYPE CHECK
    // ------------------------------------------

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    // ------------------------------------------
    // FILE SIZE CHECK
    // ------------------------------------------

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Image size must be less than 5MB",
      });
    }

    // ------------------------------------------
    // UPLOAD NEW IMAGE
    // ------------------------------------------

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

    // ------------------------------------------
    // SAVE OLD PUBLIC ID
    // ------------------------------------------

    const oldPublicId = user.profilePicturePublicId;

    // ------------------------------------------
    // SAVE NEW IMAGE
    // ------------------------------------------

    user.profilePicture = uploadResult.secure_url;

    user.profilePicturePublicId = uploadResult.public_id;

    await user.save();

    // ------------------------------------------
    // DELETE OLD IMAGE
    // ------------------------------------------

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

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
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

    // ------------------------------------------
    // DELETE FROM CLOUDINARY
    // ------------------------------------------

    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId, {
          resource_type: "image",
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError.message);
      }
    }

    // ------------------------------------------
    // CLEAR DATABASE
    // ------------------------------------------

    user.profilePicture = "";
    user.profilePicturePublicId = "";

    await user.save();

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

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError.replace("Password", "New password"),
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------
    // VERIFY CURRENT PASSWORD
    // ------------------------------------------

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // ------------------------------------------
    // PREVENT SAME PASSWORD
    // ------------------------------------------

    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // ------------------------------------------
    // UPDATE PASSWORD
    // ------------------------------------------

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
