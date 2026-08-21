import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");

  const [message, setMessage] = useState(
    "Verifying your payment with Kora...",
  );

  useEffect(() => {
    let redirectTimer;

    const verifyPayment = async () => {
      try {
        console.log(
          "🔥 PAYMENT CALLBACK LOADED",
        );

        console.log(
          "🔥 Current URL:",
          window.location.href,
        );

        // ============================================================
        // GET PAYMENT PARAMETERS
        // ============================================================

        const reference =
          searchParams.get("reference") ||
          searchParams.get("trxref") ||
          searchParams.get("payment_reference");

        const paymentStatus =
          searchParams.get("payment");

        const orderId =
          searchParams.get("orderId");

        console.log(
          "🔥 Payment reference:",
          reference,
        );

        console.log(
          "🔥 Payment status:",
          paymentStatus,
        );

        console.log(
          "🔥 Order ID:",
          orderId,
        );

        // ============================================================
        // CASE 1
        // PAYMENT ALREADY SUCCESSFUL
        //
        // Your current redirect URL appears as:
        //
        // /order-history?payment=success&orderId=...
        //
        // In this situation there is no reference available here.
        // The Kora webhook handles payment confirmation on the backend.
        // ============================================================

        if (
          paymentStatus === "success" &&
          orderId
        ) {
          console.log(
            "✅ Payment success detected from redirect",
          );

          setStatus("success");

          setMessage(
            "Payment successful. Redirecting to your orders...",
          );

          redirectTimer = setTimeout(() => {
            console.log(
              "🚀 Redirecting to order history",
            );

            navigate(
              `/order-history?payment=success&orderId=${encodeURIComponent(
                orderId,
              )}`,
              {
                replace: true,
              },
            );
          }, 1500);

          return;
        }

        // ============================================================
        // CASE 2
        // PAYMENT REFERENCE EXISTS
        //
        // Verify the transaction with the backend.
        // ============================================================

        if (reference) {
          console.log(
            "🔎 Verifying payment using reference",
          );

          const response = await fetch(
            `${API_BASE}/api/payments/kora/verify/${encodeURIComponent(
              reference,
            )}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          console.log(
            "🔥 Verification HTTP status:",
            response.status,
          );

          let data = {};

          try {
            data = await response.json();
          } catch (error) {
            console.error(
              "❌ Unable to parse verification response:",
              error,
            );
          }

          console.log(
            "🔥 Payment verification response:",
            data,
          );

          // ==========================================================
          // PAYMENT VERIFIED
          // ==========================================================

          if (
            response.ok &&
            data.success &&
            data.paid
          ) {
            setStatus("success");

            setMessage(
              "Payment successful. Redirecting to your orders...",
            );

            const verifiedOrderId =
              data.orderId || orderId;

            redirectTimer = setTimeout(() => {
              console.log(
                "🚀 Redirecting to order history",
              );

              if (verifiedOrderId) {
                navigate(
                  `/order-history?payment=success&orderId=${encodeURIComponent(
                    verifiedOrderId,
                  )}`,
                  {
                    replace: true,
                  },
                );
              } else {
                navigate(
                  "/order-history?payment=success",
                  {
                    replace: true,
                  },
                );
              }
            }, 1500);

            return;
          }

          // ==========================================================
          // PAYMENT NOT YET CONFIRMED
          // ==========================================================

          setStatus("failed");

          setMessage(
            data.message ||
              "Your payment could not be confirmed yet. Please check your order history.",
          );

          return;
        }

        // ============================================================
        // CASE 3
        // NO REFERENCE AND NO SUCCESS PARAMETERS
        // ============================================================

        console.error(
          "❌ No payment reference or successful payment parameters found",
        );

        setStatus("failed");

        setMessage(
          "Payment information was not found. Please check your order history.",
        );
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

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [navigate, searchParams]);

  // ==============================================================
  // GO TO ORDER HISTORY
  // ==============================================================

  const goToOrderHistory = () => {
    navigate("/order-history", {
      replace: true,
    });
  };

  // ==============================================================
  // UI
  // ==============================================================

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd5] p-8 max-w-md w-full text-center">

        {/* ========================================================
            VERIFYING
        ======================================================== */}

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

        {/* ========================================================
            SUCCESS
        ======================================================== */}

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

        {/* ========================================================
            FAILED
        ======================================================== */}

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
              onClick={goToOrderHistory}
              className="mt-6 bg-[#5a3825] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#43291c] transition"
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