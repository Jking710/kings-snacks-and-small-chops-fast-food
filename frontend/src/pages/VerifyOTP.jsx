import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(
      () => setCountdown((c) => c - 1),
      1000
    );

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (error) setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = [...otp];

    pasted.split("").forEach((char, i) => {
      if (i < 6) {
        newOtp[i] = char;
      }
    });

    setOtp(newOtp);

    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            otp: otpString,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "OTP verification failed."
        );
      }

      navigate("/reset-password", {
        state: {
          email,
          resetToken: data.resetToken,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "OTP verification failed. Please try again."
      );

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setResendMsg("");
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to resend OTP."
        );
      }

      setResendMsg(
        "A new OTP has been sent to your email."
      );

      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] flex items-center justify-center px-4 py-12">

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white opacity-5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-linear-to-r from-[#3b2418] via-[#5a3825] to-[#8b5e3c] px-8 py-6 text-center">

            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-2"
            >
              <FontAwesomeIcon
                icon={faCrown}
                className="text-white text-3xl"
              />

              <h1 className="font-['Georgia'] font-bold text-2xl text-white">
                Kings{" "}
                <span className="text-[#d9b99b]">
                  Chops
                </span>
              </h1>
            </Link>

            <p className="text-[#ead9cc] text-sm mt-1">
              Enter Verification Code
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
                Check Your Email
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-[#7a4a2d]">
                  {email}
                </span>
                . Enter it below.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {resendMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm text-center">
                {resendMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* OTP Inputs */}
              <div
                className="flex gap-3 justify-center mb-6"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) =>
                      (inputRefs.current[index] = el)
                    }
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(index, e)
                    }
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all ${
                      digit
                        ? "border-[#8b5e3c] bg-[#faf4ef] text-[#5a3825]"
                        : "border-gray-200 text-[#3b2418] focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#eadfd6]"
                    }`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  otp.join("").length < 6
                }
                className="w-full bg-linear-to-r from-[#5a3825] to-[#8b5e3c] text-white py-3 rounded-xl font-semibold text-sm hover:from-[#3b2418] hover:to-[#6f452d] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">

                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>

                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>

            </form>

            {/* Resend */}
            <div className="mt-5 text-center">

              <p className="text-sm text-gray-500 mb-2">
                Didn't get the code?
              </p>

              <button
                onClick={handleResend}
                disabled={
                  countdown > 0 ||
                  resendLoading
                }
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7a4a2d] hover:text-[#3b2418] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >

                <RefreshCw
                  className={`w-4 h-4 ${
                    resendLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : resendLoading
                  ? "Sending..."
                  : "Resend OTP"}

              </button>

            </div>

            {/* Different Email */}
            <div className="mt-4 text-center">

              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#7a4a2d] font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Use a different email
              </Link>

            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-4">
          © {new Date().getFullYear()} Kings Chops. All rights reserved.
        </p>

      </div>
    </div>
  );
}

export default VerifyOTP;