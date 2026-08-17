import express from "express";

import {
  initializeKoraPayment,
  handleKoraWebhook,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("🔥 PAYMENT ROUTES FILE LOADED 🔥🔥");

// Debug middleware
router.use((req, res, next) => {
  console.log("🔥 PAYMENT ROUTER ENTERED");
  console.log("🔥 PATH:", JSON.stringify(req.path));
  console.log("🔥 METHOD:", req.method);
  next();
});

// Test route
router.post("/kora/test", (req, res) => {
  console.log("🔥 KORA TEST ROUTE HIT");

  res.json({
    success: true,
    message: "Kora POST route is working",
  });
});

// Initialize payment
router.post(
  "/kora/initialize",
  protect,
  initializeKoraPayment
);

// Kora webhook
router.post(
  "/kora/webhook",
  handleKoraWebhook
);

export default router;
