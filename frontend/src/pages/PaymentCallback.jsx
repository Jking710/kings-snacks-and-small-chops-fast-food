import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");

  const [message, setMessage] = useState(
    "Checking your payment status..."
  );

  useEffect(() => {
    const paymentStatus =
      searchParams.get("payment");

    const orderId =
      searchParams.get("orderId");

    const orderCode =
      searchParams.get("orderCode");

    console.log("🔥 PAYMENT CALLBACK PAGE LOADED");

    console.log(
      "🔥 Current URL:",
      window.location.href
    );

    console.log(
      "🔥 Payment status:",
      paymentStatus
    );

    console.log(
      "🔥 Order ID:",
      orderId
    );

    console.log(
      "🔥 Order code:",
      orderCode
    );

    // ==========================================================
    // SUCCESS
    // ==========================================================

    if (paymentStatus === "success") {
      console.log(
        "✅ Payment was successfully confirmed"
      );

      setStatus("success");

      setMessage(
        orderCode
          ? `Order ${orderCode} has been confirmed. Redirecting to your orders...`
          : "Your payment was successful. Redirecting to your orders..."
      );

      const timer = setTimeout(() => {
        navigate("/order-history", {
          replace: true,
        });
      }, 1500);

      return () => clearTimeout(timer);
    }

    // ==========================================================
    // PENDING
    // ==========================================================

    if (paymentStatus === "pending") {
      console.log(
        "⏳ Payment is still pending"
      );

      setStatus("verifying");

      setMessage(
        "Your payment is still being confirmed. Redirecting to your orders..."
      );

      const timer = setTimeout(() => {
        navigate("/order-history", {
          replace: true,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }

    // ==========================================================
    // FAILED
    // ==========================================================

    if (paymentStatus === "failed") {
      console.error(
        "❌ Payment failed"
      );

      setStatus("failed");

      setMessage(
        "Your payment could not be confirmed. Please check your order history."
      );

      return;
    }

    // ==========================================================
    // UNKNOWN CALLBACK
    // ==========================================================

    console.error(
      "❌ Unknown payment callback parameters"
    );

    setStatus("failed");

    setMessage(
      "We could not determine the payment status. Please check your order history."
    );
  }, [navigate, searchParams]);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd5] p-8 max-w-md w-full text-center">

        {/* VERIFYING */}

        {status === "verifying" && (
          <>
            <div className="w-20 h-20 rounded-full bg-[#f3ebe5] flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[#6b4226] animate-spin" />
            </div>

            <h1 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
              Processing Payment
            </h1>

            <p className="text-gray-500 mt-3">
              {message}
            </p>
          </>
        )}

        {/* SUCCESS */}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
              Payment Successful
            </h1>

            <p className="text-gray-500 mt-3">
              {message}
            </p>
          </>
        )}

        {/* FAILED */}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
              Payment Not Confirmed
            </h1>

            <p className="text-gray-500 mt-3">
              {message}
            </p>

            <button
              onClick={() =>
                navigate("/order-history", {
                  replace: true,
                })
              }
              className="mt-6 bg-[#5a3825] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#45291b] transition"
            >
              Go to Order History
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default PaymentCallback;