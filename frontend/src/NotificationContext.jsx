import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext.jsx";

const NotificationContext =
  createContext(null);

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export function NotificationProvider({
  children,
}) {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchNotifications =
    useCallback(async () => {
      if (!isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        return [];
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/notifications`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch notifications"
          );
        }

        const list = Array.isArray(
          data.notifications
        )
          ? data.notifications
          : [];

        setNotifications(list);

        setUnreadCount(
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : list.filter(
                (item) => !item.isRead
              ).length
        );

        return list;
      } catch (error) {
        console.error(
          "Fetch notifications error:",
          error
        );

        setError(
          error.message ||
            "Failed to fetch notifications"
        );

        return [];
      } finally {
        setLoading(false);
      }
    }, [isAuthenticated]);

  const markAsRead = useCallback(
    async (id) => {
      if (!isAuthenticated || !id) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/notifications/${id}/read`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to mark notification as read"
          );
        }

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === id
              ? {
                  ...item,
                  isRead: true,
                  readAt:
                    data.notification?.readAt ||
                    new Date().toISOString(),
                }
              : item
          )
        );

        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );

        return data.notification;
      } catch (error) {
        console.error(
          "Mark notification as read error:",
          error
        );

        throw error;
      }
    },
    [isAuthenticated]
  );

  const markAllAsRead =
    useCallback(async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/notifications/read-all`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to mark all notifications as read"
          );
        }

        const readAt =
          new Date().toISOString();

        setNotifications((previous) =>
          previous.map((item) => ({
            ...item,
            isRead: true,
            readAt:
              item.readAt || readAt,
          }))
        );

        setUnreadCount(0);

        return data;
      } catch (error) {
        console.error(
          "Mark all notifications as read error:",
          error
        );

        throw error;
      }
    }, [isAuthenticated]);

  const refreshNotifications =
    useCallback(async () => {
      return fetchNotifications();
    }, [fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError("");
      return;
    }

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    isAuthenticated,
    fetchNotifications,
  ]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    ]
  );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}