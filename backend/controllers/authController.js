const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../config/email");

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
// GENERATE 6 DIGIT CODE
// ==========================================

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==========================================
// SEND VERIFICATION EMAIL
// ==========================================

const sendVerificationEmail = async (user) => {
  const code = generateCode();

  user.emailVerificationCode = code;

  // Code valid for 10 minutes
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Verify your ExpensePilot account",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        background: #f8fafc;
        border-radius: 12px;
      ">
        <h1 style="color:#2563eb;">
          ExpensePilot
        </h1>

        <h2>Verify your email</h2>

        <p>
          Hello ${user.name},
        </p>

        <p>
          Thank you for creating your ExpensePilot account.
          Please use the verification code below:
        </p>

        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          background: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px;
          color: #2563eb;
        ">
          ${code}
        </div>

        <p>
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>

        <hr />

        <p style="color:#64748b;">
          ExpensePilot
        </p>
      </div>
    `,
  });
};

// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        try {
          await sendVerificationEmail(existingUser);

          return res.status(200).json({
            success: true,
            requiresVerification: true,
            message:
              "Account already exists but email is not verified. A new verification code has been sent.",
            email: existingUser.email,
          });
        } catch (emailError) {
          console.error("Verification email error:", emailError);

          return res.status(500).json({
            success: false,
            message: "Account exists but verification email could not be sent",
          });
        }
      }

      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      // New users must verify email
      isEmailVerified: false,
    });

    try {
      await sendVerificationEmail(user);
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      // Remove account if email cannot be sent
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message:
          "Account could not be created because verification email could not be sent",
      });
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: "Account created successfully. Please verify your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating account",
    });
  }
};

// ==========================================
// VERIFY EMAIL
// ==========================================

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        message: "Verification code is invalid. Please request a new code.",
      });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    if (user.emailVerificationCode !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while verifying email",
    });
  }
};

// ==========================================
// RESEND VERIFICATION CODE
// ==========================================

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    await sendVerificationEmail(user);

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // EMAIL VERIFICATION CHECK
    // ==========================================

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Please verify your email before logging in",
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
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

    res.status(500).json({
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

    // Don't reveal whether email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset code has been sent.",
      });
    }

    const code = generateCode();

    user.passwordResetCode = code;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "ExpensePilot password reset code",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f8fafc;
          border-radius: 12px;
        ">
          <h1 style="color:#2563eb;">
            ExpensePilot
          </h1>

          <h2>Password Reset</h2>

          <p>
            Hello ${user.name},
          </p>

          <p>
            We received a request to reset your ExpensePilot password.
          </p>

          <p>
            Your password reset code is:
          </p>

          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            background: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
            color: #2563eb;
          ">
            ${code}
          </div>

          <p>
            This code will expire in <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
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

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "Reset code is invalid or expired",
      });
    }

    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: "Reset code has expired",
      });
    }

    if (user.passwordResetCode !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.passwordResetCode = null;
    user.passwordResetExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
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

    res.status(200).json({
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

    res.status(500).json({
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

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      user.name = name.trim();
    }

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

    res.status(200).json({
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

    res.status(500).json({
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

    user.profilePicture = uploadResult.secure_url;

    await user.save();

    res.status(200).json({
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

    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
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

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
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
  verifyEmail,
  resendVerificationCode,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  uploadProfilePicture,
  changePassword,
};
