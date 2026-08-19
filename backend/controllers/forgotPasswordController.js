import crypto from "crypto";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

console.log("🔥 FORGOT PASSWORD CONTROLLER LOADED 🔥");

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  console.log("🔥 FORGOT PASSWORD CONTROLLER HIT 🔥");
  console.log("Request body:", req.body);

  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("Searching for:", normalizedEmail);

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      console.log("No user found for:", normalizedEmail);

      return res.status(200).json({
        success: true,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    console.log("User found:", user._id);

    // Google-only accounts do not have passwords
    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        message:
          "This account uses Google Sign-In. Please sign in with Google instead.",
      });
    }

    // ─────────────────────────────────────────
    // GENERATE OTP
    // ─────────────────────────────────────────

    const otp = crypto.randomInt(100000, 1000000).toString();

    console.log("Generated OTP:", otp);

    // ─────────────────────────────────────────
    // HASH OTP
    // ─────────────────────────────────────────

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    console.log("Hashed OTP:", hashedOTP);

    // ─────────────────────────────────────────
    // OTP EXPIRY
    // ─────────────────────────────────────────

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // ─────────────────────────────────────────
    // SAVE OTP
    // ─────────────────────────────────────────

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpiry = otpExpiry;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    console.log("✅ OTP saved successfully");

    console.log("OTP expiry:", otpExpiry);

    // ─────────────────────────────────────────
    // SEND EMAIL
    // ─────────────────────────────────────────

    try {
      await sendOTPEmail(user.email, otp, user.firstName);

      console.log("✅ OTP email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("❌ OTP email error:", emailError.stack || emailError);

      // Clear OTP if email sending fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;

      await user.save();

      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email address.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error.stack || error);

    return res.status(500).json({
      message: "Failed to send OTP. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY OTP
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────

export const verifyOTP = async (req, res) => {
  console.log("🔥🔥 VERIFY OTP CONTROLLER HIT 🔥🔥");

  console.log("VERIFY OTP BODY:", req.body);

  try {
    const { email, otp } = req.body;

    // ─────────────────────────────────────────
    // VALIDATE EMAIL
    // ─────────────────────────────────────────

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    // ─────────────────────────────────────────
    // VALIDATE OTP
    // ─────────────────────────────────────────

    if (otp === undefined || otp === null || !String(otp).trim()) {
      return res.status(400).json({
        message: "OTP is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const normalizedOTP = String(otp).trim();

    console.log("EMAIL RECEIVED:", normalizedEmail);

    console.log("OTP RECEIVED:", normalizedOTP);

    // ─────────────────────────────────────────
    // VALIDATE OTP FORMAT
    // ─────────────────────────────────────────

    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        message: "OTP must be a 6-digit number.",
      });
    }

    // ─────────────────────────────────────────
    // HASH SUBMITTED OTP
    // ─────────────────────────────────────────

    const hashedOTP = crypto
      .createHash("sha256")
      .update(normalizedOTP)
      .digest("hex");

    console.log("HASHED SUBMITTED OTP:", hashedOTP);

    // ─────────────────────────────────────────
    // FIND USER
    // ─────────────────────────────────────────

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetPasswordOTP +resetPasswordOTPExpiry +resetPasswordToken +resetPasswordTokenExpiry",
    );

    console.log("USER RESULT:", user ? "USER FOUND" : "USER NOT FOUND");

    if (user) {
      console.log("USER ID:", user._id);

      console.log("STORED OTP HASH:", user.resetPasswordOTP);

      console.log("OTP EXPIRY:", user.resetPasswordOTPExpiry);

      console.log("CURRENT TIME:", new Date());
    }

    // ─────────────────────────────────────────
    // USER NOT FOUND
    // ─────────────────────────────────────────

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // ─────────────────────────────────────────
    // OTP DOES NOT EXIST
    // ─────────────────────────────────────────

    if (!user.resetPasswordOTP) {
      return res.status(400).json({
        message: "No password reset OTP was found. Please request a new OTP.",
      });
    }

    // ─────────────────────────────────────────
    // CHECK OTP EXPIRY
    // ─────────────────────────────────────────

    if (
      !user.resetPasswordOTPExpiry ||
      user.resetPasswordOTPExpiry.getTime() < Date.now()
    ) {
      console.log("❌ OTP HAS EXPIRED");

      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;

      await user.save();

      return res.status(400).json({
        message: "Your OTP has expired. Please request a new one.",
      });
    }

    // ─────────────────────────────────────────
    // COMPARE OTP
    // ─────────────────────────────────────────

    if (user.resetPasswordOTP !== hashedOTP) {
      console.log("❌ OTP HASH DOES NOT MATCH");

      console.log("Expected hash:", user.resetPasswordOTP);

      console.log("Received hash:", hashedOTP);

      return res.status(400).json({
        message: "Invalid OTP. Please check the code and try again.",
      });
    }

    console.log("✅ OTP HASH MATCHED");

    // ─────────────────────────────────────────
    // GENERATE RESET TOKEN
    // ─────────────────────────────────────────

    const resetToken = crypto.randomBytes(32).toString("hex");

    console.log("Reset token generated.");

    // ─────────────────────────────────────────
    // HASH RESET TOKEN
    // ─────────────────────────────────────────

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // ─────────────────────────────────────────
    // SAVE RESET TOKEN
    // ─────────────────────────────────────────

    user.resetPasswordToken = hashedResetToken;

    user.resetPasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // OTP has now been used
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;

    await user.save();

    console.log("✅ RESET TOKEN SAVED");

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("❌ VERIFY OTP ERROR:", error.stack || error);

    return res.status(500).json({
      message: "OTP verification failed. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  console.log("🔥 RESET PASSWORD CONTROLLER HIT 🔥");

  console.log("RESET PASSWORD BODY:", {
    email: req.body?.email,
    hasResetToken: !!req.body?.resetToken,
    hasPassword: !!req.body?.newPassword,
  });

  try {
    const { email, resetToken, newPassword } = req.body;

    // ─────────────────────────────────────────
    // VALIDATE FIELDS
    // ─────────────────────────────────────────

    if (
      !email ||
      !email.trim() ||
      !resetToken ||
      !resetToken.trim() ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // ─────────────────────────────────────────
    // PASSWORD LENGTH
    // ─────────────────────────────────────────

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    // ─────────────────────────────────────────
    // NORMALIZE EMAIL
    // ─────────────────────────────────────────

    const normalizedEmail = email.toLowerCase().trim();

    // ─────────────────────────────────────────
    // HASH RESET TOKEN
    // ─────────────────────────────────────────

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken.trim())
      .digest("hex");

    console.log("Hashed reset token generated.");

    // ─────────────────────────────────────────
    // FIND USER
    // ─────────────────────────────────────────

    const user = await User.findOne({
      email: normalizedEmail,

      resetPasswordToken: hashedResetToken,

      resetPasswordTokenExpiry: {
        $gt: new Date(),
      },
    }).select("+password +resetPasswordToken +resetPasswordTokenExpiry");

    console.log("RESET USER:", user ? "USER FOUND" : "USER NOT FOUND");

    // ─────────────────────────────────────────
    // INVALID TOKEN
    // ─────────────────────────────────────────

    if (!user) {
      return res.status(400).json({
        message: "Reset session expired. Please start over.",
      });
    }

    // ─────────────────────────────────────────
    // UPDATE PASSWORD
    // ─────────────────────────────────────────

    user.password = newPassword;

    // Allow Google account to use
    // email/password after reset
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

    // ─────────────────────────────────────────
    // SAVE USER
    // ─────────────────────────────────────────

    await user.save();

    console.log("✅ PASSWORD RESET SUCCESSFUL FOR:", normalizedEmail);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error.stack || error);

    return res.status(500).json({
      message: "Password reset failed. Please try again.",
    });
  }
};
