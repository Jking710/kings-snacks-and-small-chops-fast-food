import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ResetPassword() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, resetToken, navigate]);

  const getStrength = (password) => {
    if (!password) {
      return {
        label: "",
        color: "",
        width: "0%",
      };
    }

    if (password.length < 6) {
      return {
        label: "Too short",
        color: "bg-red-400",
        width: "25%",
      };
    }

    if (password.length < 8) {
      return {
        label: "Weak",
        color: "bg-orange-400",
        width: "50%",
      };
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return {
        label: "Fair",
        color: "bg-yellow-400",
        width: "75%",
      };
    }

    return {
      label: "Strong",
      color: "bg-green-500",
      width: "100%",
    };
  };

  const strength = getStrength(formData.newPassword);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            resetToken,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Password reset failed."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      setError(
        err.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
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
              Set New Password
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">

            {success ? (

              /* Success State */
              <div className="text-center py-4">

                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

                <h2 className="text-xl font-bold text-[#3b2418] font-['Georgia'] mb-2">
                  Password Reset
                </h2>

                <p className="text-gray-500 text-sm mb-4">
                  Your password has been updated
                  successfully. Redirecting you to
                  login...
                </p>

                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#8b5e3c] h-1.5 rounded-full animate-pulse w-full" />
                </div>

              </div>

            ) : (

              /* Form State */
              <>

                <div className="mb-6">

                  <h2 className="text-2xl font-bold text-[#3b2418] font-['Georgia']">
                    New Password
                  </h2>

                  <p className="text-gray-500 text-sm mt-2">
                    Choose a strong password for your
                    Kings Chops account.
                  </p>

                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">

                    <AlertCircle className="w-4 h-4 shrink-0" />

                    <span>{error}</span>

                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* New Password */}
                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      New Password
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="newPassword"
                        required
                        value={
                          formData.newPassword
                        }
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#e5d8cf] focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] focus:border-[#8b5e3c] transition-all text-sm text-[#3b2418]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7a4a2d] cursor-pointer transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                    </div>

                    {/* Password Strength */}
                    {formData.newPassword && (
                      <div className="mt-2">

                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">

                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                            style={{
                              width:
                                strength.width,
                            }}
                          />

                        </div>

                        <p
                          className={`text-xs mt-1 font-medium ${
                            strength.label ===
                            "Strong"
                              ? "text-green-600"
                              : strength.label ===
                                "Fair"
                              ? "text-yellow-600"
                              : "text-red-500"
                          }`}
                        >
                          {strength.label}
                        </p>

                      </div>
                    )}

                  </div>

                  {/* Confirm Password */}
                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5e3c] w-5 h-5" />

                      <input
                        type={
                          showConfirm
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        required
                        value={
                          formData.confirmPassword
                        }
                        onChange={handleChange}
                        placeholder="Repeat your password"
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] focus:border-transparent transition-all text-sm ${
                          formData.confirmPassword &&
                          formData.newPassword !==
                            formData.confirmPassword
                            ? "border-red-300 bg-red-50"
                            : formData.confirmPassword &&
                              formData.newPassword ===
                                formData.confirmPassword
                            ? "border-green-300 bg-green-50"
                            : "border-[#e5d8cf]"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirm(
                            !showConfirm
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7a4a2d] cursor-pointer transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                    </div>

                    {formData.confirmPassword &&
                      formData.newPassword ===
                        formData.confirmPassword && (
                        <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Passwords match
                        </p>
                      )}

                  </div>

                  {/* Reset Button */}
                  <button
                    type="submit"
                    disabled={loading}
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

                        Resetting Password...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                </form>

                {/* Back to Login */}
                <div className="mt-5 text-center">

                  <Link
                    to="/login"
                    className="text-sm text-gray-500 hover:text-[#7a4a2d] font-medium transition-colors"
                  >
                    Back to Login
                  </Link>

                </div>

              </>
            )}

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

export default ResetPassword;