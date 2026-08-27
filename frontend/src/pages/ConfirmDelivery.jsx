import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle, PackageCheck, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ConfirmDelivery() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmDelivery = async (delivered) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("kc_token");

      const response = await fetch(
        `${API_BASE}/orders/${id}/confirm-delivery`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            delivered: delivered,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update delivery status");
      }

      // Return to Order History after successful confirmation
      navigate("/order-history");
    } catch (error) {
      console.error("Confirm delivery error:", error);

      setError(error.message || "Unable to update delivery status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-7 sm:p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-6">
            <PackageCheck size={40} className="text-orange-600" />
          </div>

          {/* Heading */}
          <p className="text-sm font-semibold text-orange-600 mb-2">
            DELIVERY CONFIRMATION
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Has your order been delivered?
          </h1>

          <p className="text-gray-500 leading-relaxed mb-8">
            Please confirm whether you received your order. Your response will
            update the order status in your Order History.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* YES */}
            <button
              type="button"
              disabled={loading}
              onClick={() => confirmDelivery(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <CheckCircle size={20} />
              )}
              Yes, Delivered
            </button>

            {/* NO */}
            <button
              type="button"
              disabled={loading}
              onClick={() => confirmDelivery(false)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <XCircle size={20} />
              )}
              No, Not Delivered
            </button>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/order-history")}
            disabled={loading}
            className="mt-6 text-sm text-gray-500 hover:text-orange-600 transition disabled:opacity-50"
          >
            Go back to Order History
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelivery;
