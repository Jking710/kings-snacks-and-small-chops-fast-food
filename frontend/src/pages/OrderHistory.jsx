import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CalendarDays,
  ArrowRight,
  Loader2,
  ShoppingBag,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH ORDERS
  // ============================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // ----------------------------------------------------------
      // GET STORED AUTH TOKEN
      // ----------------------------------------------------------

      const token = localStorage.getItem("kc_token");

      console.log(
        "🔐 Order History token:",
        token ? "Token found" : "Token missing"
      );

      if (!token) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      // ----------------------------------------------------------
      // REQUEST USER ORDERS
      // ----------------------------------------------------------

      const response = await fetch(
        `${API_BASE}/api/orders/my-orders`,
        {
          method: "GET",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ----------------------------------------------------------
      // READ RESPONSE
      // ----------------------------------------------------------

      const data = await response.json();

      console.log("📦 Order history response:", data);

      // ----------------------------------------------------------
      // AUTHENTICATION ERROR
      // ----------------------------------------------------------

      if (response.status === 401) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      // ----------------------------------------------------------
      // OTHER API ERRORS
      // ----------------------------------------------------------

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load your orders"
        );
      }

      // ----------------------------------------------------------
      // SAVE ORDERS
      // ----------------------------------------------------------

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "❌ Order history error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your order history"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      "en-NG",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // ORDER STATUS
  // ============================================================

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          className:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle,
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
        };

      case "preparing":
        return {
          label: "Preparing",
          icon: Package,
          className:
            "bg-orange-50 text-orange-700 border-orange-200",
        };

      case "ready":
        return {
          label: "Ready",
          icon: Package,
          className:
            "bg-purple-50 text-purple-700 border-purple-200",
        };

      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          icon: Truck,
          className:
            "bg-indigo-50 text-indigo-700 border-indigo-200",
        };

      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle,
          className:
            "bg-green-50 text-green-700 border-green-200",
        };

      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle,
          className:
            "bg-green-50 text-green-700 border-green-200",
        };

      case "failed":
        return {
          label: "Failed",
          icon: XCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      default:
        return {
          label: "Pending",
          icon: Clock,
          className:
            "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={36}
            className="animate-spin text-orange-600"
          />

          <p className="text-gray-600">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="min-h-[70vh] bg-orange-50 px-6 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 text-center shadow-sm">
          <XCircle
            size={50}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to load your orders
          </h2>

          <p className="text-gray-500 mb-6">
            {error}
          </p>

          <button
            onClick={fetchOrders}
            className="px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-orange-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">

            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <ShoppingBag
                size={25}
                className="text-orange-600"
              />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Order History
              </h1>

              <p className="text-gray-500 mt-1">
                View and track all your Kings Snacks orders.
              </p>
            </div>

          </div>
        </div>

        {/* EMPTY STATE */}

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">

            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-5">
              <ShoppingBag
                size={36}
                className="text-orange-600"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No orders yet
            </h2>

            <p className="text-gray-500 mb-7">
              Your completed and recent orders will appear here.
            </p>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
            >
              Browse Menu
              <ArrowRight size={18} />
            </Link>

          </div>
        ) : (

          /* ORDERS */

          <div className="space-y-6">

            {orders.map((order) => {

              const status = getStatusInfo(
                order.orderStatus
              );

              const StatusIcon = status.icon;

              const deliveryAlreadyConfirmed =
                order.deliveryConfirmed === true;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden"
                >

                  {/* ORDER TOP SECTION */}

                  <div className="p-5 sm:p-6 border-b border-gray-100">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div>

                        <div className="flex flex-wrap items-center gap-3 mb-2">

                          <h2 className="text-lg font-bold text-gray-900">
                            {order.orderCode}
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold ${status.className}`}
                          >
                            <StatusIcon size={15} />
                            {status.label}
                          </span>

                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">

                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            {formatDate(order.createdAt)}
                          </span>

                          <span>
                            {formatTime(order.createdAt)}
                          </span>

                        </div>

                      </div>

                      <div className="text-left lg:text-right">

                        <p className="text-sm text-gray-500">
                          Total
                        </p>

                        <p className="text-xl font-bold text-gray-900">
                          ₦
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString()}
                        </p>

                        <p
                          className={`text-xs mt-1 ${
                            order.paymentStatus ===
                            "paid"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          Payment:{" "}
                          {order.paymentStatus ===
                          "paid"
                            ? "Successful"
                            : "Pending"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ITEMS */}

                  <div className="p-5 sm:p-6">

                    <h3 className="font-semibold text-gray-800 mb-4">
                      Items
                    </h3>

                    <div className="space-y-4">

                      {order.items?.map(
                        (item, index) => (

                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center gap-4"
                          >

                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 shrink-0">

                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    size={24}
                                    className="text-orange-300"
                                  />
                                </div>
                              )}

                            </div>

                            <div className="flex-1 min-w-0">

                              <p className="font-semibold text-gray-800 truncate">
                                {item.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                Quantity:{" "}
                                {item.quantity}
                              </p>

                            </div>

                            <p className="font-semibold text-gray-800">
                              ₦
                              {(
                                Number(
                                  item.price || 0
                                ) *
                                Number(
                                  item.quantity || 0
                                )
                              ).toLocaleString()}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* DELIVERY ACTIONS */}

                  <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100">

                    {deliveryAlreadyConfirmed ? (

                      <div className="flex items-center justify-center sm:justify-between gap-4">

                        <div className="flex items-center gap-3">

                          {order.deliveryStatus ===
                          "delivered" ? (
                            <CheckCircle
                              size={22}
                              className="text-green-600"
                            />
                          ) : (
                            <XCircle
                              size={22}
                              className="text-red-600"
                            />
                          )}

                          <div>

                            <p className="text-sm font-semibold text-gray-700">
                              Delivery confirmation
                            </p>

                            <p
                              className={`text-sm font-semibold ${
                                order.deliveryStatus ===
                                "delivered"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {order.deliveryStatus ===
                              "delivered"
                                ? "Completed"
                                : "Failed"}
                            </p>

                          </div>

                        </div>

                      </div>

                    ) : (

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                          <p className="text-sm font-semibold text-gray-700">
                            Delivery status
                          </p>

                          <p className="text-sm text-gray-500">
                            {status.label}
                          </p>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">

                          {/* TRACK ORDER */}

                          <Link
                            to={`/track-order/${order._id}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                          >
                            <Truck size={18} />
                            Track Your Order
                          </Link>

                          {/* CONFIRM DELIVERY */}

                          <Link
                            to={`/confirm-delivery/${order._id}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                          >
                            <CheckCircle size={18} />
                            Confirm Delivery
                          </Link>

                        </div>

                      </div>

                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default OrderHistory;