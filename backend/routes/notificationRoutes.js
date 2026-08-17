import express from "express";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
============================================================
GET ALL MY NOTIFICATIONS
============================================================
*/

router.get(
  "/",
  protect,
  getMyNotifications
);

/*
============================================================
GET UNREAD NOTIFICATION COUNT
============================================================
*/

router.get(
  "/unread-count",
  protect,
  getUnreadNotificationCount
);

/*
============================================================
MARK ALL NOTIFICATIONS AS READ
============================================================
*/

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

/*
============================================================
CREATE NOTIFICATION
============================================================
*/

router.post(
  "/",
  protect,
  createNotification
);

/*
============================================================
GET SINGLE NOTIFICATION
============================================================
*/

router.get(
  "/:id",
  protect,
  getNotificationById
);

/*
============================================================
MARK ONE NOTIFICATION AS READ
============================================================
*/

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

/*
============================================================
DELETE ONE NOTIFICATION
============================================================
*/

router.delete(
  "/:id",
  protect,
  deleteNotification
);

/*
============================================================
DELETE ALL NOTIFICATIONS
============================================================
*/

router.delete(
  "/",
  protect,
  deleteAllNotifications
);

export default router;