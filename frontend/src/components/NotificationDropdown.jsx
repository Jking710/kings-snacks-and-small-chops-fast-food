import React from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ShoppingBag,
  CreditCard,
  ShoppingCart,
  Info,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../NotificationContext.jsx";

function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

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

  const getTimeAgo = (date) => {
    if (!date) return "";

    const now = new Date();
    const created = new Date(date);

    const difference = Math.floor(
      (now - created) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      const minutes = Math.floor(
        difference / 60
      );

      return `${minutes}m ago`;
    }

    if (difference < 86400) {
      const hours = Math.floor(
        difference / 3600
      );

      return `${hours}h ago`;
    }

    const days = Math.floor(
      difference / 86400
    );

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString();
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    onClose();

    navigate(
      `/notifications/${notification._id}`
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-[#ead9cd] rounded-2xl shadow-2xl overflow-hidden z-100">

      {/* HEADER */}

      <div className="flex items-center justify-between px-5 py-4 border-b border-[#ead9cd] bg-[#fffaf7]">

        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#8b563b]" />

            <h3 className="font-bold text-gray-900">
              Notifications
            </h3>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }`
              : "You're all caught up"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-[#f6eee8] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

      </div>

      {/* MARK ALL */}

      {unreadCount > 0 && (
        <div className="px-5 py-2 border-b border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 text-xs font-semibold text-[#8b563b] hover:text-[#5a3825] transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      {/* NOTIFICATIONS */}

      <div className="max-h-[430px] overflow-y-auto">

        {loading ? (
          <div className="px-5 py-10 text-center">
            <div className="w-7 h-7 mx-auto border-2 border-[#ead9cd] border-t-[#8b563b] rounded-full animate-spin" />

            <p className="text-sm text-gray-500 mt-3">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-[#f6eee8] flex items-center justify-center">
              <Bell className="w-7 h-7 text-[#8b563b]" />
            </div>

            <h4 className="font-semibold text-gray-800 mt-4">
              No notifications
            </h4>

            <p className="text-sm text-gray-500 mt-1">
              New updates from Kings Chops will appear here.
            </p>

          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() =>
                handleNotificationClick(
                  notification
                )
              }
              className={`w-full text-left px-5 py-4 border-b border-gray-100 transition cursor-pointer ${
                notification.isRead
                  ? "bg-white hover:bg-[#fffaf7]"
                  : "bg-[#fff7f1] hover:bg-[#fdf0e7]"
              }`}
            >
              <div className="flex gap-3">

                {/* ICON */}

                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    notification.isRead
                      ? "bg-gray-100 text-gray-500"
                      : "bg-[#f6eee8] text-[#8b563b]"
                  }`}
                >
                  {getIcon(
                    notification.type
                  )}
                </div>

                {/* CONTENT */}

                <div className="flex-1 min-w-0">

                  <div className="flex items-start justify-between gap-2">

                    <h4
                      className={`text-sm truncate ${
                        notification.isRead
                          ? "font-semibold text-gray-700"
                          : "font-bold text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </h4>

                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#9a5f3d] shrink-0 mt-1.5" />
                    )}

                  </div>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between mt-2">

                    <span className="text-[11px] text-gray-400">
                      {getTimeAgo(
                        notification.createdAt
                      )}
                    </span>

                    {!notification.isRead && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8b563b]">
                        <Check className="w-3 h-3" />
                        Unread
                      </span>
                    )}

                  </div>

                </div>

              </div>
            </button>
          ))
        )}

      </div>

      {/* FOOTER */}

      {notifications.length > 0 && (
        <div className="border-t border-[#ead9cd] bg-[#fffaf7]">

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/notifications");
            }}
            className="w-full py-3 text-sm font-semibold text-[#8b563b] hover:bg-[#f6eee8] transition cursor-pointer"
          >
            View all notifications
          </button>

        </div>
      )}

    </div>
  );
}

export default NotificationDropdown;