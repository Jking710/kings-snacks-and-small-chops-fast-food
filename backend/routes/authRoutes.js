import express from "express";

import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  updatePhone,
  logout,
} from "../controllers/authController.js";

import {
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/forgotPasswordController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("🔥 AUTH ROUTES FILE LOADED 🔥");

// Public routes

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.post(
  "/google",
  googleAuth
);

// Password reset routes

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-otp",
  verifyOTP
);

router.post(
  "/reset-password",
  resetPassword
);

// Protected routes

router.get(
  "/me",
  protect,
  getMe
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/phone",
  protect,
  updatePhone
);

router.post(
  "/logout",
  logout
);

export default router;