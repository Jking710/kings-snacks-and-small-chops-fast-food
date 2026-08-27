import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotifications } from "../NotificationContext.jsx";

function NotificationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { notifications, markAsRead } = useNotifications();

  const [notification, setNotification] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  ============================================================
  GET NOTIFICATION ICON
  ============================================================
  */

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-7 h-7" />;

      case "payment":
        return <CreditCard className="w-7 h-7" />;

      case "cart":
        return <ShoppingCart className="w-7 h-7" />;

      case "delivery":
        return <Truck className="w-7 h-7" />;

      case "welcome":
        return <Bell className="w-7 h-7" />;

      case "login":
        return <CheckCheck className="w-7 h-7" />;

      default:
        return <Info className="w-7 h-7" />;
    }
  };

  /*
  ============================================================
  GET NOTIFICATION DATE
  ============================================================
  */

  const getFormattedDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  /*
  ============================================================
  LOAD NOTIFICATION
  ============================================================
  */
  const loadNotification = useCallback(async () => {
    if (!id) {
      setError("Notification ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const existingNotification = notifications.find(
        (item) => item._id === id,
      );

      if (existingNotification) {
        setNotification(existingNotification);

        if (!existingNotification.isRead) {
          await markAsRead(id);

          setNotification((current) =>
            current
              ? {
                  ...current,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : current,
          );
        }

        return;
      }

      const API_BASE =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notification.");
      }

      if (!data.notification) {
        throw new Error("Notification was not found.");
      }

      setNotification(data.notification);

      if (!data.notification.isRead) {
        await markAsRead(id);

        setNotification((current) =>
          current
            ? {
                ...current,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : current,
        );
      }
    } catch (error) {
      console.error("Load notification error:", error);

      setError(error.message || "Could not load this notification.");
    } finally {
      setLoading(false);
    }
  }, [id, notifications, markAsRead]);

  /*
  ============================================================
  LOAD WHEN ID CHANGES
  ============================================================
  */

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  /*
  ============================================================
  LOADING STATE
  ============================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf7] px-4 py-10 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-[#ead9cd] rounded-2xl p-12 text-center">
            <div className="w-9 h-9 mx-auto border-2 border-[#ead9cd] border-t-[#8b563b] rounded-full animate-spin" />

            <p className="text-sm text-gray-500 mt-4">
              Loading notification...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR STATE
  ============================================================
  */

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-[#fffaf7] px-4 py-10 md:px-10">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="flex items-center gap-2 text-sm font-semibold text-[#8b563b] hover:text-[#5a3825] transition cursor-pointer mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to notifications
          </button>

          <div className="bg-white border border-[#ead9cd] rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f6eee8] flex items-center justify-center">
              <Bell className="w-8 h-8 text-[#8b563b]" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 mt-5">
              Notification not found
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {error ||
                "This notification does not exist or is no longer available."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="mt-6 px-5 py-2.5 rounded-xl bg-[#7a4a2d] text-white text-sm font-semibold hover:bg-[#5a3825] transition cursor-pointer"
            >
              View notifications
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  MAIN PAGE
  ============================================================
  */

  return (
    <div className="min-h-screen bg-[#fffaf7] px-4 py-10 md:px-10">
      <div className="max-w-3xl mx-auto">
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="flex items-center gap-2 text-sm font-semibold text-[#8b563b] hover:text-[#5a3825] transition cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to notifications
        </button>

        {/* NOTIFICATION CARD */}

        <div className="bg-white border border-[#ead9cd] rounded-2xl overflow-hidden shadow-sm">
          {/* HEADER */}

          <div className="px-6 py-6 md:px-8 border-b border-[#ead9cd] bg-[#fffaf7]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f6eee8] text-[#8b563b] flex items-center justify-center shrink-0">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                      {notification.title}
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                      {getFormattedDate(notification.createdAt)}
                    </p>
                  </div>

                  {notification.isRead && (
                    <span className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      Read
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}

          <div className="px-6 py-8 md:px-8">
            <p className="text-base leading-7 text-gray-600 whitespace-pre-line">
              {notification.message}
            </p>

            {/* METADATA */}

            {notification.metadata &&
              Object.keys(notification.metadata).length > 0 && (
                <div className="mt-8 p-5 rounded-xl bg-[#fffaf7] border border-[#ead9cd]">
                  <h2 className="text-sm font-bold text-gray-800 mb-4">
                    Details
                  </h2>

                  <div className="space-y-3">
                    {Object.entries(notification.metadata).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <span className="text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>

                          <span className="font-medium text-gray-800 text-right break-all">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* LINK */}

            {notification.link && (
              <button
                type="button"
                onClick={() => {
                  navigate(notification.link);
                }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7a4a2d] text-white text-sm font-semibold hover:bg-[#5a3825] transition cursor-pointer"
              >
                View related activity
              </button>
            )}
          </div>

          {/* FOOTER */}

          <div className="px-6 py-4 md:px-8 border-t border-gray-100 bg-[#fffaf7]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCheck className="w-4 h-4 text-[#8b563b]" />

              {notification.isRead
                ? "You have read this notification."
                : "This notification has been marked as read."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationDetailsPage;
