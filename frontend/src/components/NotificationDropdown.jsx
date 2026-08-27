import React from "react";

import {
  Bell,
  CheckCheck,
  CreditCard,
  Info,
  ShoppingBag,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useNotifications } from "../NotificationContext.jsx";

function NotificationDropdown({
  onClose,
}) {
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
        return (
          <ShoppingBag className="w-5 h-5" />
        );

      case "payment":
        return (
          <CreditCard className="w-5 h-5" />
        );

      case "cart":
        return (
          <ShoppingCart className="w-5 h-5" />
        );

      case "delivery":
        return (
          <Truck className="w-5 h-5" />
        );

      case "welcome":
        return (
          <Bell className="w-5 h-5" />
        );

      case "login":
        return (
          <CheckCheck className="w-5 h-5" />
        );

      default:
        return (
          <Info className="w-5 h-5" />
        );
    }
  };

  const getTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const handleNotificationClick =
    async (notification) => {
      try {
        if (!notification.isRead) {
          await markAsRead(
            notification._id
          );
        }

        onClose?.();

        navigate(
          `/notifications/${notification._id}`
        );
      } catch (error) {
        console.error(
          "Notification click error:",
          error
        );
      }
    };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  return (
    <div className="absolute right-0 top-full mt-3 w-[min(390px,calc(100vw-24px))] bg-white border border-[#ead9cd] rounded-2xl shadow-2xl overflow-hidden z-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#ead9cd] bg-[#fffaf7]">
        <div>
          <h3 className="font-bold text-gray-900">
            Notifications
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount === 1
                    ? ""
                    : "s"
                }`
              : "You're all caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs font-semibold text-[#8b563b] hover:text-[#5a3825] cursor-pointer"
            >
              Mark all as read
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-[#f6eee8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto">
        {loading &&
        notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-7 h-7 mx-auto border-2 border-[#ead9cd] border-t-[#8b563b] rounded-full animate-spin" />

            <p className="text-sm text-gray-500 mt-3">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length ===
          0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#f6eee8] text-[#8b563b] flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>

            <h4 className="font-semibold text-gray-800 mt-4">
              No notifications
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              New account, cart, order, payment,
              and delivery updates appear here.
            </p>
          </div>
        ) : (
          notifications.map(
            (notification) => (
              <button
                type="button"
                key={notification._id}
                onClick={() =>
                  handleNotificationClick(
                    notification
                  )
                }
                className={`w-full text-left px-5 py-4 border-b border-gray-100 transition cursor-pointer ${
                  notification.isRead
                    ? "bg-white hover:bg-[#fffaf7]"
                    : "bg-[#f6eee8] hover:bg-[#ead9cd]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      notification.isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-white text-[#8b563b]"
                    }`}
                  >
                    {getIcon(
                      notification.type
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4
                        className={`text-sm ${
                          notification.isRead
                            ? "font-semibold text-gray-700"
                            : "font-bold text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h4>

                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#9a5f3d] mt-1.5 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-2">
                      {getTime(
                        notification.createdAt
                      )}
                    </p>
                  </div>
                </div>
              </button>
            )
          )
        )}
      </div>

      <div className="px-5 py-3 bg-[#fffaf7] border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            navigate("/notifications");
          }}
          className="w-full text-sm font-semibold text-[#8b563b] hover:text-[#5a3825] cursor-pointer"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;