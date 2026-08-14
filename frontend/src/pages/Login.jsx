import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = React.useRef(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login (e.g. if they were sent here from a protected route)
  const from = location.state?.from?.pathname || "/";

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  // ─── Google Sign In ────────────────────────────────────────────────
  const handleGoogleResponse = React.useCallback(
    async (response) => {
      setGoogleLoading(true);
      setError("");

      try {
        await googleLogin(response.credential, false);
        navigate(from, { replace: true });
      } catch (err) {
        setError(err.message || "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, navigate, from],
  );

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: googleButtonRef.current.offsetWidth,
          text: "signin_with",
          shape: "rectangular",
        });
      }
    };

    const scriptId = "google-gsi-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener("load", initializeGoogle);
      }

      return () => {
        existingScript.removeEventListener("load", initializeGoogle);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;

    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [handleGoogleResponse]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-600 via-orange-500 to-rose-700 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white opacity-5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-black opacity-5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-yellow-600 to-orange-600 px-8 py-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faCrown} className="text-white text-3xl" />
              <h1 className="font-['Georgia'] font-bold text-2xl text-white">
                Kings <span className="text-yellow-200">Chops</span>
              </h1>
            </Link>
            <p className="text-orange-100 text-sm mt-1">
              Sign in to place your order
            </p>
          </div>

          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Georgia']">
              Welcome Back! 👋
            </h2>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

             <div className="flex justify-end">
  <Link
    to="/forgot-password"
    className="text-sm text-orange-600 hover:text-orange-800 font-medium"
  >
    Forgot password?
  </Link>
</div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-600 to-rose-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-orange-700 hover:to-rose-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg"
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
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Google Sign In */}
            {/* Google Sign In */}
            <div
              ref={googleButtonRef}
              className="w-full flex justify-center"
            ></div>

            <p className="text-center mt-6 text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-orange-600 font-semibold hover:text-orange-800 hover:underline"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/70 text-xs mt-4">
          © {new Date().getFullYear()} Kings Chops. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
