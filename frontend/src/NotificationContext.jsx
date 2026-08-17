import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NOTIFICATION_API = `${API_BASE}/notifications`;

function NotificationProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
  ============================================================
  API REQUEST HELPER
  ============================================================
  */

  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        console.error("Notification API error:", {
          status: response.status,
          url,
          data,
        });

        const message =
          data?.message ||
          `Notification request failed with status ${response.status}`;

        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error("Notification request failed:", error);
      throw error;
    }
  }, []);

  /*
  ============================================================
  GET ALL NOTIFICATIONS
  ============================================================
  */

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching notifications from:",
        `${NOTIFICATION_API}`
      );

      const data = await apiFetch(NOTIFICATION_API);

      const notificationList = Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setNotifications(notificationList);

      const unread = notificationList.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(unread);

      return notificationList;
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );

      setError(error.message);

      setNotifications([]);
      setUnreadCount(0);

      return [];
    } finally {
      setLoading(false);
    }
  }, [user, apiFetch]);

  /*
  ============================================================
  GET UNREAD COUNT
  ============================================================
  */

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const data = await apiFetch(
        `${NOTIFICATION_API}/unread-count`
      );

      const count =
        typeof data?.unreadCount === "number"
          ? data.unreadCount
          : 0;

      setUnreadCount(count);

      return count;
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error
      );

      return 0;
    }
  }, [user, apiFetch]);

  /*
  ============================================================
  CREATE NOTIFICATION
  ============================================================
  */

  const createNotification = useCallback(
    async ({
      type = "general",
      title,
      message,
      link = "",
      metadata = {},
    }) => {
      if (!user) {
        throw new Error("You must be logged in.");
      }

      if (!title || !message) {
        throw new Error(
          "Notification title and message are required."
        );
      }

      try {
        const data = await apiFetch(NOTIFICATION_API, {
          method: "POST",
          body: JSON.stringify({
            type,
            title,
            message,
            link,
            metadata,
          }),
        });

        if (data?.notification) {
          setNotifications((previous) => [
            data.notification,
            ...previous,
          ]);

          setUnreadCount((previous) => previous + 1);
        }

        return data?.notification || null;
      } catch (error) {
        console.error(
          "Failed to create notification:",
          error
        );

        throw error;
      }
    },
    [user, apiFetch]
  );

  /*
  ============================================================
  MARK ONE AS READ
  ============================================================
  */

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      try {
        const data = await apiFetch(
          `${NOTIFICATION_API}/${notificationId}/read`,
          {
            method: "PATCH",
          }
        );

        const updatedNotification = data?.notification;

        setNotifications((previous) =>
          previous.map((notification) =>
            notification._id === notificationId
              ? updatedNotification || {
                  ...notification,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : notification
          )
        );

        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );

        return updatedNotification;
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );

        throw error;
      }
    },
    [apiFetch]
  );

  /*
  ============================================================
  MARK ALL AS READ
  ============================================================
  */

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await apiFetch(`${NOTIFICATION_API}/read-all`, {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      throw error;
    }
  }, [user, apiFetch]);

  /*
  ============================================================
  DELETE ONE
  ============================================================
  */

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      try {
        await apiFetch(
          `${NOTIFICATION_API}/${notificationId}`,
          {
            method: "DELETE",
          }
        );

        setNotifications((previous) =>
          previous.filter(
            (notification) =>
              notification._id !== notificationId
          )
        );

        setUnreadCount((previous) => {
          const deletedNotification =
            notifications.find(
              (notification) =>
                notification._id === notificationId
            );

          if (
            deletedNotification &&
            !deletedNotification.isRead
          ) {
            return Math.max(0, previous - 1);
          }

          return previous;
        });
      } catch (error) {
        console.error(
          "Failed to delete notification:",
          error
        );

        throw error;
      }
    },
    [apiFetch, notifications]
  );

  /*
  ============================================================
  DELETE ALL
  ============================================================
  */

  const deleteAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      await apiFetch(NOTIFICATION_API, {
        method: "DELETE",
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to delete all notifications:",
        error
      );

      throw error;
    }
  }, [user, apiFetch]);

  /*
  ============================================================
  GET SINGLE NOTIFICATION
  ============================================================
  */

  const getNotificationById = useCallback(
    async (notificationId) => {
      if (!notificationId) return null;

      try {
        const data = await apiFetch(
          `${NOTIFICATION_API}/${notificationId}`
        );

        return data?.notification || null;
      } catch (error) {
        console.error(
          "Failed to get notification:",
          error
        );

        throw error;
      }
    },
    [apiFetch]
  );

  /*
  ============================================================
  LOAD NOTIFICATIONS AFTER LOGIN
  ============================================================
  */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
  }, [
    user,
    authLoading,
    fetchNotifications,
  ]);

  /*
  ============================================================
  REFRESH NOTIFICATIONS
  ============================================================
  */

  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    await fetchNotifications();
  }, [user, fetchNotifications]);

  /*
  ============================================================
  CONTEXT VALUE
  ============================================================
  */

  const value = {
    notifications,
    unreadCount,
    loading,
    error,

    fetchNotifications,
    fetchUnreadCount,
    refreshNotifications,

    createNotification,

    markAsRead,
    markAllAsRead,

    deleteNotification,
    deleteAllNotifications,

    getNotificationById,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/*
============================================================
CUSTOM HOOK
============================================================
*/

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
};

export default NotificationContext;
export { NotificationProvider };