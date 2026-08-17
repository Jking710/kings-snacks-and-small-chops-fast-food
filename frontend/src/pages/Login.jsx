import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const googleButtonRef = React.useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSuccessPopup, setShowSuccessPopup] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const { login, googleLogin, isAuthenticated } =
    useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from?.pathname || "/";

  // ─────────────────────────────────────────────────────────────
  // DO NOT REDIRECT IMMEDIATELY AFTER LOGIN
  // ─────────────────────────────────────────────────────────────
  //
  // AuthContext changes isAuthenticated immediately after login.
  // The old code redirected here before the popup had time to show.
  //
  // We now handle navigation inside handleSubmit and
  // handleGoogleResponse after showing the popup.
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
  }, [isAuthenticated]);

  // ─────────────────────────────────────────────────────────────
  // SHOW SUCCESS POPUP
  // ─────────────────────────────────────────────────────────────

  const showLoginSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
  };

  // ─────────────────────────────────────────────────────────────
  // GOOGLE SIGN IN
  // ─────────────────────────────────────────────────────────────

  const handleGoogleResponse =
    React.useCallback(
      async (response) => {
        setGoogleLoading(true);
        setError("");

        try {
          await googleLogin(
            response.credential,
            false
          );

          showLoginSuccess(
            "Welcome back! You have successfully signed in with Google."
          );

          setTimeout(() => {
            navigate(from, {
              replace: true,
            });
          }, 1500);
        } catch (err) {
          setError(
            err.message ||
              "Google sign-in failed. Please try again."
          );
        } finally {
          setGoogleLoading(false);
        }
      },
      [googleLogin, navigate, from]
    );

  // ─────────────────────────────────────────────────────────────
  // GOOGLE IDENTITY SERVICES
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const initializeGoogle = () => {
      if (
        !window.google ||
        !import.meta.env.VITE_GOOGLE_CLIENT_ID
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id:
          import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: handleGoogleResponse,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "outline",
            size: "large",
            width:
              googleButtonRef.current
                .offsetWidth,
            text: "signin_with",
            shape: "rectangular",
          }
        );
      }
    };

    const scriptId = "google-gsi-script";

    const existingScript =
      document.getElementById(scriptId);

    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener(
          "load",
          initializeGoogle
        );
      }

      return () => {
        existingScript.removeEventListener(
          "load",
          initializeGoogle
        );
      };
    }

    const script =
      document.createElement("script");

    script.id = scriptId;

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [handleGoogleResponse]);

  // ─────────────────────────────────────────────────────────────
  // INPUT CHANGE
  // ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // NORMAL LOGIN
  // ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        formData.email,
        formData.password
      );

      // Show popup first.
      showLoginSuccess(
        "Welcome back! You have successfully signed in."
      );

      // Give the popup time to display.
      setTimeout(() => {
        navigate(from, {
          replace: true,
        });
      }, 1500);
    } catch (err) {
      setError(
        err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] flex items-center justify-center px-4 py-12">

      {/* ─────────────────────────────────────────────── */}
      {/* SUCCESS POPUP */}
      {/* ─────────────────────────────────────────────── */}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 pointer-events-none">

          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#ead9cd] px-6 py-6 pointer-events-auto animate-[fadeIn_0.25s_ease-out]">

            <div className="flex flex-col items-center text-center">

              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">

                <CheckCircle className="w-9 h-9 text-green-600" />

              </div>

              <h3 className="text-xl font-bold text-[#3b2418] font-['Georgia'] mb-2">
                Login Successful
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {successMessage}
              </p>

              <div className="w-full h-1 bg-[#ead9cd] rounded-full mt-5 overflow-hidden">

                <div className="h-full bg-green-600 rounded-full animate-[progress_1.5s_linear]" />

              </div>

              <p className="text-xs text-gray-400 mt-3">
                Taking you to your account...
              </p>

            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* BACKGROUND DECORATION */}
      {/* ─────────────────────────────────────────────── */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#d6a77a] opacity-10 rounded-full blur-3xl" />

        <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#b86b45] opacity-10 rounded-full blur-3xl" />

        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#e8c39e] opacity-5 rounded-full blur-2xl" />

      </div>

      {/* ─────────────────────────────────────────────── */}
      {/* LOGIN CARD */}
      {/* ─────────────────────────────────────────────── */}

      <div className="relative w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}

          <div className="bg-linear-to-r from-[#3b2418] via-[#5a3825] to-[#7a4a2d] px-8 py-6 text-center">

            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-2"
            >

              <FontAwesomeIcon
                icon={faCrown}
                className="text-[#e8c39e] text-3xl"
              />

              <h1 className="font-['Georgia'] font-bold text-2xl text-white">

                Kings{" "}

                <span className="text-[#e8c39e]">
                  Chops
                </span>

              </h1>

            </Link>

            <p className="text-[#d9b99c] text-sm mt-1">
              Sign in to place your order
            </p>

          </div>

          <div className="px-8 py-8">

            <h2 className="text-2xl font-bold text-[#3b2418] mb-6 font-['Georgia']">
              Welcome Back! 👋
            </h2>

            {/* Error */}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">

                <AlertCircle className="w-4 h-4 shrink-0" />

                <span>{error}</span>

              </div>
            )}

            {/* Login Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label className="block text-sm font-semibold text-[#4a3428] mb-1.5">
                  Email Address
                </label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a96f4f] w-5 h-5" />

                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={
                      loading ||
                      googleLoading
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ead9cd] bg-[#fffdfb] focus:outline-none focus:ring-2 focus:ring-[#a96f4f]/30 focus:border-[#a96f4f] transition-all text-sm disabled:opacity-60"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label className="block text-sm font-semibold text-[#4a3428] mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a96f4f] w-5 h-5" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={
                      loading ||
                      googleLoading
                    }
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#ead9cd] bg-[#fffdfb] focus:outline-none focus:ring-2 focus:ring-[#a96f4f]/30 focus:border-[#a96f4f] transition-all text-sm disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={
                      loading ||
                      googleLoading
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7a4a2d] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >

                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>

              {/* Forgot Password */}

              <div className="flex justify-end">

                <Link
                  to="/forgot-password"
                  className="text-sm text-[#8b563b] hover:text-[#5a3825] font-medium transition-colors"
                >
                  Forgot password?
                </Link>

              </div>

              {/* Sign In Button */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
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

                    Signing in...

                  </span>
                ) : (
                  "Sign In"
                )}

              </button>

            </form>

            {/* Divider */}

            <div className="flex items-center my-6">

              <div className="flex-1 border-t border-[#ead9cd]" />

              <span className="px-4 text-sm text-[#a88b79]">
                or
              </span>

              <div className="flex-1 border-t border-[#ead9cd]" />

            </div>

            {/* Google Sign In */}

            <div
              ref={googleButtonRef}
              className={`w-full flex justify-center ${
                googleLoading
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            />

            {/* Register */}

            <p className="text-center mt-6 text-sm text-gray-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="text-[#8b563b] font-semibold hover:text-[#5a3825] hover:underline transition-colors"
              >
                Create one here
              </Link>

            </p>

          </div>

        </div>

        <p className="text-center text-[#d9b99c]/70 text-xs mt-4">

          © {new Date().getFullYear()} Kings Chops.
          All rights reserved.

        </p>

      </div>

      {/* Popup animations */}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-15px) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes progress {
            from {
              width: 100%;
            }

            to {
              width: 0%;
            }
          }
        `}
      </style>

    </div>
  );
}

export default Login;