import Notification from "../models/notification.js";


export const getMyNotifications = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/*
============================================================
GET UNREAD COUNT
============================================================
*/
export const getUnreadNotificationCount = async (
  req,
  res
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const unreadCount =
      await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};

/*
============================================================
GET SINGLE NOTIFICATION
============================================================
*/
export const getNotificationById = async (
  req,
  res
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Get notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
    });
  }
};

/*
============================================================
MARK ONE AS READ
============================================================
*/
export const markNotificationAsRead =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();

        await notification.save();
      }

      return res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to mark notification",
      });
    }
  };

/*
============================================================
MARK ALL AS READ
============================================================
*/
export const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark all error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark all notifications",
      });
    }
  };

/*
============================================================
CREATE NOTIFICATION
============================================================
*/
export const createNotification = async (
  req,
  res
) => {
  try {
    const {
      type,
      title,
      message,
      link,
      metadata,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Title and message are required",
      });
    }

    const notification =
      await Notification.create({
        user: req.user._id,
        type: type || "general",
        title: title.trim(),
        message: message.trim(),
        link: link || "",
        metadata: metadata || {},
      });

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

/*
============================================================
DELETE ONE NOTIFICATION
============================================================
*/
export const deleteNotification = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

/*
============================================================
DELETE ALL NOTIFICATIONS
============================================================
*/
export const deleteAllNotifications =
  async (req, res) => {
    try {
      await Notification.deleteMany({
        user: req.user._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "All notifications deleted",
      });
    } catch (error) {
      console.error(
        "Delete all notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notifications",
      });
    }
  };