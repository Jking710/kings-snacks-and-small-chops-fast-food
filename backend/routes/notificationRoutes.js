import express from "express";

import {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getNotifications
);

router.post(
  "/",
  protect,
  createNotification
);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

router.delete(
  "/delete-all",
  protect,
  deleteAllNotifications
);

router.get(
  "/:id",
  protect,
  getNotificationById
);

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

export default router;