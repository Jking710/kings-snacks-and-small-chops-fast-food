import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Package,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function TrackOrder() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  // ============================================================
  // LOAD ORDER
  // ============================================================

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!id) {
        throw new Error("Order ID is missing.");
      }

      // ----------------------------------------------------------
      // GET JWT TOKEN
      // ----------------------------------------------------------

      const token = localStorage.getItem("kc_token");

      console.log(
        "Track Order token:",
        token ? "Token found" : "Token missing"
      );

      if (!token) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      // ----------------------------------------------------------
      // REQUEST ORDER
      // ----------------------------------------------------------

      const response = await fetch(
        `${API_BASE}/orders/${id}`,
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

      console.log(
        "📦 Track order response:",
        data
      );

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
            "Failed to load order"
        );
      }

      // ----------------------------------------------------------
      // SAVE ORDER
      // ----------------------------------------------------------

      setOrder(data.order);
    } catch (error) {
      console.error(
        "❌ Track order error:",
        error
      );

      setError(
        error.message ||
          "Unable to load this order"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ============================================================
  // DETECT USER LOCATION
  // ============================================================

  const detectLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location detection is not supported by your browser."
      );

      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      (error) => {
        console.error(
          "❌ Location error:",
          error
        );

        let message =
          "Unable to detect your location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (error.code === 2) {
          message =
            "Your location could not be determined.";
        }

        if (error.code === 3) {
          message =
            "Location detection timed out. Please try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    loadOrder();
    detectLocation();
  }, [detectLocation, loadOrder]);

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
          icon: AlertCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: AlertCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      default:
        return {
          label: "Pending",
          icon: Clock,
          className:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
        };
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={40}
            className="animate-spin text-orange-600"
          />

          <p className="text-gray-600">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !order) {
    return (
      <div className="min-h-[70vh] bg-orange-50 px-6 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-10 text-center">
          <AlertCircle
            size={50}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to load order
          </h2>

          <p className="text-gray-500 mb-6">
            {error || "Order not found."}
          </p>

          <Link
            to="/order-history"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Order History
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATUS
  // ============================================================

  const status = getStatusInfo(
    order.orderStatus
  );

  const StatusIcon = status.icon;

  // ============================================================
  // GOOGLE MAP
  // ============================================================

  const mapUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`
    : "";

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-orange-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto">

        {/* BACK */}

        <Link
          to="/order-history"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Order History
        </Link>

        {/* HEADER */}

        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-sm text-gray-500 mb-1">
                Tracking Order
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {order.orderCode || order._id}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">

                <span className="flex items-center gap-1.5">
                  <Clock size={15} />
                  {formatDate(order.createdAt)}
                </span>

                <span>
                  {formatTime(order.createdAt)}
                </span>

              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${status.className}`}
            >
              <StatusIcon size={18} />
              {status.label}
            </div>

          </div>
        </div>

        {/* MAP */}

        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden mb-6">

          <div className="p-6 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                <MapPin
                  size={23}
                  className="text-orange-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Your Location
                </h2>

                <p className="text-sm text-gray-500">
                  Your current location is shown on the map.
                </p>
              </div>

            </div>

          </div>

          <div className="relative h-[400px] bg-gray-100">

            {locationLoading ? (

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                  <Loader2
                    size={36}
                    className="animate-spin text-orange-600 mx-auto mb-3"
                  />

                  <p className="text-gray-600">
                    Detecting your location...
                  </p>

                </div>

              </div>

            ) : location ? (

              <iframe
                title="Your current location"
                src={mapUrl}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />

            ) : (

              <div className="absolute inset-0 flex items-center justify-center px-6">

                <div className="text-center max-w-md">

                  <MapPin
                    size={42}
                    className="mx-auto mb-3 text-gray-400"
                  />

                  <h3 className="font-bold text-gray-800 mb-2">
                    Location unavailable
                  </h3>

                  <p className="text-sm text-gray-500 mb-5">
                    {locationError}
                  </p>

                  <button
                    onClick={detectLocation}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                  >
                    Try Again
                  </button>

                </div>

              </div>

            )}

          </div>

          {location && (
            <div className="p-5 bg-orange-50 border-t border-orange-100">

              <div className="flex items-start gap-3">

                <MapPin
                  size={20}
                  className="text-orange-600 mt-0.5"
                />

                <div>

                  <p className="font-semibold text-gray-800">
                    Location detected
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Latitude:{" "}
                    {location.latitude.toFixed(6)}
                  </p>

                  <p className="text-sm text-gray-500">
                    Longitude:{" "}
                    {location.longitude.toFixed(6)}
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* DELIVERY AND ITEMS */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* DELIVERY DETAILS */}

          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6">

            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Delivery Details
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-3">

                <MapPin
                  size={20}
                  className="text-orange-600 mt-1"
                />

                <div>

                  <p className="text-sm text-gray-500">
                    Delivery Address
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {order.deliveryAddress}
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-3">

                <Phone
                  size={20}
                  className="text-orange-600 mt-1"
                />

                <div>

                  <p className="text-sm text-gray-500">
                    Phone Number
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {order.phone}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ORDER ITEMS */}

          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6">

            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Your Items
            </h2>

            <div className="space-y-4">

              {order.items?.map(
                (item, index) => (

                  <div
                    key={`${order._id}-${index}`}
                    className="flex items-center gap-3"
                  >

                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 shrink-0">

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center">

                          <Package
                            size={22}
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
                        Quantity: {item.quantity}
                      </p>

                    </div>

                    <p className="font-semibold text-gray-800">
                      ₦
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toLocaleString()}
                    </p>

                  </div>

                )
              )}

            </div>

            <div className="border-t border-gray-100 mt-5 pt-5 flex items-center justify-between">

              <span className="font-semibold text-gray-700">
                Total
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₦
                {Number(
                  order.totalAmount || 0
                ).toLocaleString()}
              </span>

            </div>

          </div>

        </div>

        {/* DELIVERY CONFIRMATION */}

        {order.orderStatus !== "completed" &&
          order.orderStatus !== "failed" &&
          order.deliveryConfirmed !== true && (

            <div className="mt-6 bg-white rounded-3xl shadow-sm border border-orange-100 p-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Have you received your order?
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Confirm delivery after your order arrives.
                  </p>

                </div>

                <Link
                  to={`/confirm-delivery/${order._id}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                >
                  <CheckCircle size={18} />
                  Delivered
                </Link>

              </div>

            </div>

          )}

      </div>
    </div>
  );
}

export default TrackOrder;