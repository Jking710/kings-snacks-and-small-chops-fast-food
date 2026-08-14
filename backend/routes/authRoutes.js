import express from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  logout,
} from "../controllers/authController.js";
import {
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/forgotPasswordController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Existing auth routes ──────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

// ─── Forgot password routes ────────────────────────────────────────────────────
router.post("/forgot-password", forgotPassword);   // Step 1: send OTP
router.post("/verify-otp", verifyOTP);             // Step 2: verify OTP
router.post("/reset-password", resetPassword);     // Step 3: set new password

export default router;