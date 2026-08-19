import express from "express";

import {
  initializeKoraPayment,
  verifyKoraPayment,
  handleKoraWebhook,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("🔥 PAYMENT ROUTES FILE LOADED 🔥🔥");

// ============================================================
// DEBUG MIDDLEWARE
// ============================================================

router.use((req, res, next) => {
  console.log("🔥 PAYMENT ROUTER ENTERED");
  console.log("🔥 PATH:", JSON.stringify(req.path));
  console.log("🔥 METHOD:", req.method);

  next();
});

// ============================================================
// TEST ROUTE
// ============================================================

router.post("/kora/test", (req, res) => {
  console.log("🔥 KORA TEST ROUTE HIT");

  res.json({
    success: true,
    message: "Kora POST route is working",
  });
});

// ============================================================
// INITIALIZE PAYMENT
// ============================================================

router.post(
  "/kora/initialize",
  protect,
  initializeKoraPayment,
);

// ============================================================
// VERIFY PAYMENT
// ============================================================

router.get(
  "/kora/verify/:reference",
  protect,
  verifyKoraPayment,
);

// ============================================================
// KORA WEBHOOK
// ============================================================

router.post(
  "/kora/webhook",
  handleKoraWebhook,
);

export default router;