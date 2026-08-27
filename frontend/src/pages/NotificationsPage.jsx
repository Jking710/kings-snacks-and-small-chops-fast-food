import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  CreditCard,
  ShoppingCart,
  Info,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../NotificationContext.jsx";

function NotificationsPage() {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
  } = useNotifications();

  const [deleting, setDeleting] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-5 h-5" />;

      case "payment":
        return <CreditCard className="w-5 h-5" />;

      case "cart":
        return <ShoppingCart className="w-5 h-5" />;

      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    navigate(`/notifications/${notification._id}`);
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0 || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all notifications?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteAllNotifications();
    } catch (error) {
      console.error("Delete all notifications error:", error);

      window.alert(error.message || "Failed to delete all notifications");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf7] px-4 py-10 md:px-10">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f6eee8] flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#8b563b]" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notifications
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Stay updated with your Kings Chops activity.
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7a4a2d] text-white text-sm font-semibold hover:bg-[#5a3825] transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="bg-white border border-[#ead9cd] rounded-2xl p-12 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-[#ead9cd] border-t-[#8b563b] rounded-full animate-spin" />

            <p className="text-sm text-gray-500 mt-4">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-[#ead9cd] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f6eee8] flex items-center justify-center">
              <Bell className="w-8 h-8 text-[#8b563b]" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-5">
              No notifications yet
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Your order, payment, and account updates will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#ead9cd] rounded-2xl overflow-hidden">
            {notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleClick(notification)}
                className={`w-full text-left p-5 border-b border-gray-100 last:border-b-0 transition cursor-pointer ${
                  notification.isRead
                    ? "hover:bg-gray-50"
                    : "bg-[#fff7f1] hover:bg-[#fdf0e7]"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      notification.isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-[#f6eee8] text-[#8b563b]"
                    }`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className={`text-base ${
                            notification.isRead
                              ? "font-semibold text-gray-700"
                              : "font-bold text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                          {getTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span className="shrink-0 text-xs font-semibold text-[#9a5f3d] bg-[#f6eee8] px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#8b563b]">
                      View notification
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* BOTTOM BUTTONS */}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#ead9cd] bg-white text-sm font-semibold text-[#8b563b] hover:bg-[#f6eee8] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0 || deleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />

            {deleting ? "Deleting..." : "Delete all notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
