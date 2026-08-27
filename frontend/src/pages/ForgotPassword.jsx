import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setSent(true);

      // After 2 seconds redirect to OTP page, passing email in state
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#d6a77a] opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#b86b45] opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#e8c39e] opacity-5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-[#3b2418] via-[#5a3825] to-[#7a4a2d] px-8 py-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <FontAwesomeIcon
                icon={faCrown}
                className="text-[#e8c39e] text-3xl"
              />

              <h1 className="font-['Georgia'] font-bold text-2xl text-white">
                Kings <span className="text-[#e8c39e]">Chops</span>
              </h1>
            </Link>

            <p className="text-[#d9b99c] text-sm mt-1">
              Password Recovery
            </p>
          </div>

          <div className="px-8 py-8">
            {sent ? (
              // ── Success state ──────────────────────────────────────────
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

                <h2 className="text-xl font-bold text-gray-800 font-['Georgia'] mb-2">
                  OTP Sent!
                </h2>

                <p className="text-gray-500 text-sm">
                  We sent a 6-digit code to <strong>{email}</strong>. Redirecting
                  you now...
                </p>
              </div>
            ) : (
              // ── Form state ─────────────────────────────────────────────
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
                    Forgot Password? 🔐
                  </h2>

                  <p className="text-gray-500 text-sm mt-2">
                    Enter your email address and we'll send you a one-time code
                    to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#4a3428] mb-1.5">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a96f4f] w-5 h-5" />

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ead9cd] bg-[#fffdfb] focus:outline-none focus:ring-2 focus:ring-[#a96f4f]/30 focus:border-[#a96f4f] transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-[#5a3825] via-[#7a4a2d] to-[#9a5f3d] text-white py-3 rounded-xl font-semibold text-sm hover:from-[#4a2d20] hover:via-[#693f29] hover:to-[#875034] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg shadow-[#5a3825]/20"
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

                        Sending OTP...
                      </span>
                    ) : (
                      "Send OTP Code"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-[#8b563b] hover:text-[#5a3825] font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[#d9b99c]/70 text-xs mt-4">
          © {new Date().getFullYear()} Kings Chops. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;