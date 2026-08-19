import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Verifying your payment with Kora...",
  );

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference =
          searchParams.get("reference") ||
          searchParams.get("trxref") ||
          searchParams.get("payment_reference");

        console.log("🔥 Payment callback loaded");
        console.log("🔥 Payment reference:", reference);

        if (!reference) {
          setStatus("failed");
          setMessage(
            "Payment reference was not found.",
          );
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/kora/verify/${encodeURIComponent(
            reference,
          )}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        console.log("🔥 Payment verification response:", data);

        if (!response.ok || !data.success || !data.paid) {
          setStatus("failed");

          setMessage(
            data.message ||
              "Your payment could not be confirmed.",
          );

          return;
        }

        // Payment has been confirmed.
        setStatus("success");
        setMessage(
          "Payment successful. Redirecting to your orders...",
        );

        // Give the user a short confirmation screen.
        setTimeout(() => {
          navigate("/order-history", {
            replace: true,
          });
        }, 1500);
      } catch (error) {
        console.error(
          "❌ Payment callback error:",
          error,
        );

        setStatus("failed");

        setMessage(
          "Unable to verify your payment. Please check your order history.",
        );
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd5] p-8 max-w-md w-full text-center">

        {status === "verifying" && (
          <>
            <div className="w-20 h-20 rounded-full bg-[#f3ebe5] flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[#6b4226] animate-spin" />
            </div>

            <h1 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
              Verifying Payment
            </h1>

            <p className="text-gray-500 mt-3">
              {message}
            </p>
          </>
        )}

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
                navigate("/order-history")
              }
              className="mt-6 bg-[#5a3825] text-white px-6 py-3 rounded-xl font-bold"
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