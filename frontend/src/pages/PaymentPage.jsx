import React, { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderData = location.state;

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-[#8b5e3c] mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-[#3b2418] font-['Georgia'] mb-2">
            No payment found
          </h2>

          <p className="text-gray-500 mb-6">
            Please return to your cart and start checkout again.
          </p>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 bg-linear-to-r from-[#4a2c1d] to-[#7a4a2d] text-white px-6 py-3 rounded-xl font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  const {
    cartItems = [],
    totalPrice = 0,
    deliveryFee = 0,
    grandTotal = 0,
    phone = "",
    deliveryAddress = "",
  } = orderData;

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("kc_token");

      if (!token) {
        setError(
          "Your login session has expired. Please sign in again."
        );

        setLoading(false);
        navigate("/login");

        return;
      }

      const apiUrl = (
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000"
      ).replace(/\/+$/, "");

      const response = await fetch(
        `${apiUrl}/api/payments/kora/initialize`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          credentials: "include",

          body: JSON.stringify({
            items: cartItems,
            subtotal: totalPrice,
            deliveryFee,
            totalAmount: grandTotal,
            deliveryAddress,
            phone,
          }),
        }
      );

      const responseText = await response.text();

      console.log(
        "Payment response status:",
        response.status
      );

      console.log(
        "Payment response:",
        responseText
      );

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          `Server returned an invalid response. Status: ${response.status}`
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("kc_token");

        setError(
          "Your login session has expired. Please sign in again."
        );

        setLoading(false);

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Payment initialization failed with status ${response.status}.`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to initialize payment."
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "Kora checkout link was not returned."
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(
        "Payment initialization error:",
        error
      );

      setError(
        error.message ||
          "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-[#ead9cb] hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8" />

            <h1 className="text-3xl font-bold font-['Georgia']">
              Payment
            </h1>
          </div>

          <p className="text-[#ead9cb] mt-2 text-sm">
            Complete your bank transfer securely through Kora.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#e8ddd5] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#f3ebe5] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#6b4226]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#3b2418] font-['Georgia'] text-lg">
                    Bank Transfer
                  </h2>

                  <p className="text-sm text-gray-500">
                    Pay securely through Kora.
                  </p>
                </div>
              </div>

              <div className="bg-[#f8f3ef] rounded-2xl p-5">
                <p className="text-sm text-gray-600 mb-2">
                  Amount to Pay
                </p>

                <p className="text-3xl font-bold text-[#6b4226]">
                  ₦{grandTotal.toLocaleString()}
                </p>

                <p className="text-sm text-gray-500 mt-3">
                  You will be redirected to Kora to complete your bank transfer.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />

                  <div>
                    <p className="font-semibold text-green-800 text-sm">
                      Automatic payment verification
                    </p>

                    <p className="text-sm text-green-700 mt-1">
                      You do not need to enter a transfer reference or upload
                      payment proof. Kora will notify our server after your
                      payment is successful.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />

                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-6 bg-linear-to-r from-[#4a2c1d] via-[#5a3825] to-[#7a4a2d] text-white py-3 rounded-xl font-bold hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting to Kora...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₦{grandTotal.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8ddd5] sticky top-24">
              <h3 className="font-bold text-gray-800 text-lg font-['Georgia'] mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id || item.productId || index}
                    className="flex justify-between gap-3"
                  >
                    <span className="truncate">
                      {item.name} ×{item.quantity}
                    </span>

                    <span className="font-medium text-gray-700 whitespace-nowrap">
                      ₦
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>

                  <span>
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>

                  <span>
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-gray-800 text-base pt-3 border-t border-gray-100">
                  <span>Total</span>

                  <span className="text-[#6b4226]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#f3ebe5] rounded-xl p-3 mt-5 text-xs text-[#6b4226]">
                🚚 Estimated delivery:{" "}
                <strong>30–45 minutes</strong>
                <br />
                📍 Delivering within Lagos Island & Mainland
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;