import crypto from "crypto";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/sendEmail.js";


// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Send OTP to email
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    // Normalize email
    const normalizedEmail = email
      .toLowerCase()
      .trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If this email exists, an OTP has been sent.",
      });
    }

    // Google-only accounts don't have passwords
    if (
      user.authProvider === "google" &&
      !user.password
    ) {
      return res.status(400).json({
        message:
          "This account uses Google Sign-In. Please sign in with Google instead.",
      });
    }


    // ─────────────────────────────────────────
    // Generate 6-digit OTP
    // ─────────────────────────────────────────

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    console.log(
      "Generated OTP:",
      otp
    );


    // ─────────────────────────────────────────
    // Hash OTP before storing it
    // ─────────────────────────────────────────

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");


    // ─────────────────────────────────────────
    // OTP expires in 10 minutes
    // ─────────────────────────────────────────

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );


    // ─────────────────────────────────────────
    // DEBUG EMAIL CONFIG
    // ─────────────────────────────────────────

    console.log(
      "========== EMAIL DEBUG =========="
    );

    console.log(
      "EMAIL_USER:",
      process.env.EMAIL_USER
    );

    console.log(
      "EMAIL_PASS exists:",
      !!process.env.EMAIL_PASS
    );

    console.log(
      "EMAIL_PASS length:",
      process.env.EMAIL_PASS?.length
    );

    console.log(
      "================================="
    );


    // ─────────────────────────────────────────
    // SAVE OTP BEFORE SENDING EMAIL
    // ─────────────────────────────────────────

    user.resetPasswordOTP = hashedOTP;

    user.resetPasswordOTPExpiry = otpExpiry;

    // Clear any previous reset token
    user.resetPasswordToken = undefined;

    user.resetPasswordTokenExpiry = undefined;

    await user.save();


    // ─────────────────────────────────────────
    // SEND OTP EMAIL — ONLY ONCE
    // ─────────────────────────────────────────

    await sendOTPEmail(
      user.email,
      otp,
      user.firstName
    );


    return res.status(200).json({
      success: true,
      message:
        "OTP sent to your email address.",
    });

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to send OTP. Please try again.",
    });
  }
};



// ─────────────────────────────────────────────────────────────
// VERIFY OTP
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────

export const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;


    // Validate fields
    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required.",
      });
    }


    // Normalize email
    const normalizedEmail = email
      .toLowerCase()
      .trim();


    // Normalize OTP
    const normalizedOTP = String(otp)
      .trim();


    // Validate OTP format
    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        message:
          "OTP must be a 6-digit number.",
      });
    }


    // ─────────────────────────────────────────
    // Hash submitted OTP
    // ─────────────────────────────────────────

    const hashedOTP = crypto
      .createHash("sha256")
      .update(normalizedOTP)
      .digest("hex");


    // ─────────────────────────────────────────
    // Find user with matching OTP
    // AND non-expired OTP
    // ─────────────────────────────────────────

    const user = await User.findOne({
      email: normalizedEmail,

      resetPasswordOTP: hashedOTP,

      resetPasswordOTPExpiry: {
        $gt: new Date(),
      },

    }).select(
      "+resetPasswordOTP +resetPasswordOTPExpiry"
    );


    // OTP doesn't match or has expired
    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired OTP. Please request a new one.",
      });
    }


    console.log(
      "✅ OTP verified for:",
      normalizedEmail
    );


    // ─────────────────────────────────────────
    // Generate reset token
    // ─────────────────────────────────────────

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");


    // Hash reset token before storing
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    // Reset token expires in 15 minutes
    user.resetPasswordToken =
      hashedResetToken;

    user.resetPasswordTokenExpiry =
      new Date(
        Date.now() + 15 * 60 * 1000
      );


    // ─────────────────────────────────────────
    // OTP HAS NOW BEEN USED
    // ─────────────────────────────────────────

    user.resetPasswordOTP = undefined;

    user.resetPasswordOTPExpiry = undefined;


    await user.save();


    return res.status(200).json({
      success: true,

      message:
        "OTP verified successfully.",

      resetToken,
    });

  } catch (error) {

    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      message:
        "OTP verification failed. Please try again.",
    });
  }
};



// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  try {

    const {
      email,
      resetToken,
      newPassword,
    } = req.body;


    // Validate fields
    if (
      !email ||
      !resetToken ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "All fields are required.",
      });
    }


    // Password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters.",
      });
    }


    // Normalize email
    const normalizedEmail = email
      .toLowerCase()
      .trim();


    // ─────────────────────────────────────────
    // Hash reset token
    // ─────────────────────────────────────────

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    // ─────────────────────────────────────────
    // Find user with valid reset token
    // ─────────────────────────────────────────

    const user = await User.findOne({

      email: normalizedEmail,

      resetPasswordToken:
        hashedResetToken,

      resetPasswordTokenExpiry: {
        $gt: new Date(),
      },

    }).select(
      "+resetPasswordToken +resetPasswordTokenExpiry"
    );


    // Reset token invalid/expired
    if (!user) {
      return res.status(400).json({
        message:
          "Reset session expired. Please start over.",
      });
    }


    // ─────────────────────────────────────────
    // UPDATE PASSWORD
    // ─────────────────────────────────────────

    // User.js pre-save hook will hash it
    user.password = newPassword;


    // If previously Google account,
    // allow it to become local/password account
    if (user.authProvider === "google") {
      user.authProvider = "local";
    }


    // ─────────────────────────────────────────
    // CLEAR RESET INFORMATION
    // ─────────────────────────────────────────

    user.resetPasswordToken = undefined;

    user.resetPasswordTokenExpiry = undefined;

    user.resetPasswordOTP = undefined;

    user.resetPasswordOTPExpiry = undefined;


    // Save user
    await user.save();


    return res.status(200).json({
      success: true,

      message:
        "Password reset successfully. You can now log in.",
    });

  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Password reset failed. Please try again.",
    });
  }
};