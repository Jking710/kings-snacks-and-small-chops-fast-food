import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmDelivery,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/:id",
  protect,
  getOrderById
);

router.patch(
  "/:id/confirm-delivery",
  protect,
  confirmDelivery
);

export default router;