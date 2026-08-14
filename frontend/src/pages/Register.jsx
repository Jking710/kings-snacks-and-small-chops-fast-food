import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../AuthContext.jsx";

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

// ─────────────────────────────────────────────────────────────
// Country list
// ─────────────────────────────────────────────────────────────

const countryNames = new Intl.DisplayNames(
  ["en"],
  {
    type: "region",
  }
);

const countries = getCountries()
  .map((country) => ({
    code: country,
    name:
      countryNames.of(country) ||
      country,
    dialCode: `+${getCountryCallingCode(
      country
    )}`,
  }))
  .sort((a, b) =>
    a.name.localeCompare(b.name)
  );

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────

function Register() {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // Default country = Nigeria
  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState("NG");

  const [
    formData,
    setFormData,
  ] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const {
    register,
    googleLogin,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  const googleButtonRef =
    useRef(null);

  // ─────────────────────────────────────────────────────────────
  // Redirect if already authenticated
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", {
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    navigate,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Google response
  // ─────────────────────────────────────────────────────────────

  const handleGoogleResponse =
    useCallback(
      async (response) => {
        if (loading) return;

        setGoogleLoading(true);
        setError("");

        try {
          await googleLogin(
            response.credential,
            true
          );

          navigate("/", {
            replace: true,
          });
        } catch (err) {
          console.error(
            "Google registration error:",
            err
          );

          // Show the exact message returned
          // by the backend.
          setError(
            err?.message ||
              "Google sign-up failed. Please try again."
          );
        } finally {
          setGoogleLoading(false);
        }
      },
      [
        googleLogin,
        navigate,
        loading,
      ]
    );

  // ─────────────────────────────────────────────────────────────
  // Google Identity Services
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const initializeGoogle =
      () => {
        if (
          !window.google ||
          !import.meta.env
            .VITE_GOOGLE_CLIENT_ID
        ) {
          return;
        }

        window.google.accounts.id.initialize(
          {
            client_id:
              import.meta.env
                .VITE_GOOGLE_CLIENT_ID,

            callback:
              handleGoogleResponse,
          }
        );

        if (
          googleButtonRef.current
        ) {
          googleButtonRef.current.innerHTML =
            "";

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: "outline",
              size: "large",

              width:
                googleButtonRef.current
                  .offsetWidth,

              text: "signup_with",
              shape: "rectangular",
            }
          );
        }
      };

    const scriptId =
      "google-gsi-script";

    const existingScript =
      document.getElementById(
        scriptId
      );

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
      document.createElement(
        "script"
      );

    script.id = scriptId;

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload =
      initializeGoogle;

    document.body.appendChild(
      script
    );

    return () => {
      script.onload = null;
    };
  }, [
    handleGoogleResponse,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Handle country change
  // ─────────────────────────────────────────────────────────────

  const handleCountryChange = (
    e
  ) => {
    const country =
      e.target.value;

    setSelectedCountry(
      country
    );

    if (error) {
      setError("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Handle inputs
  // ─────────────────────────────────────────────────────────────

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Validate phone
  // ─────────────────────────────────────────────────────────────

  const validatePhoneNumber =
    () => {
      if (
        !formData.phone.trim()
      ) {
        return {
          valid: true,
          formatted: "",
        };
      }

      try {
        const phoneNumber =
          parsePhoneNumberFromString(
            formData.phone,
            selectedCountry
          );

        if (!phoneNumber) {
          return {
            valid: false,
            formatted: "",
          };
        }

        if (
          !phoneNumber.isValid() ||
          phoneNumber.country !==
            selectedCountry
        ) {
          return {
            valid: false,
            formatted: "",
          };
        }

        return {
          valid: true,
          formatted:
            phoneNumber.number,
        };
      } catch {
        return {
          valid: false,
          formatted: "",
        };
      }
    };

  // ─────────────────────────────────────────────────────────────
  // Submit normal registration
  // ─────────────────────────────────────────────────────────────

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (loading || googleLoading) {
      return;
    }

    setError("");

    // Password confirmation
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    // Password length
    if (
      formData.password.length <
      8
    ) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    // Email validation
    const emailRegex =
      /^\S+@\S+\.\S+$/;

    const normalizedEmail =
      formData.email
        .trim()
        .toLowerCase();

    if (
      !emailRegex.test(
        normalizedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    // Phone validation
    const phoneResult =
      validatePhoneNumber();

    if (
      formData.phone.trim() &&
      !phoneResult.valid
    ) {
      setError(
        `Please enter a valid ${countryNames.of(
          selectedCountry
        )} phone number.`
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName:
          formData.firstName.trim(),

        lastName:
          formData.lastName.trim(),

        email:
          normalizedEmail,

        phone:
          phoneResult.formatted,

        password:
          formData.password,
      });

      // Registration successful
      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      // Backend sends:
      //
      // "This email has already been
      // registered. Please sign in instead."
      //
      // apiFetch throws that message,
      // so it will appear directly here.

      setError(
        err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-600 via-orange-500 to-rose-700 flex items-center justify-center px-4 py-12">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-5 rounded-full" />

        <div className="absolute bottom-20 left-10 w-60 h-60 bg-white opacity-5 rounded-full" />
      </div>

      <div className="relative w-full max-w-lg">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-linear-to-r from-yellow-600 to-orange-600 px-8 py-6 text-center">

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
                <span className="text-yellow-200">
                  Chops
                </span>
              </h1>
            </Link>

            <p className="text-orange-100 text-sm mt-1">
              Create your account and start
              ordering!
            </p>
          </div>

          <div className="px-8 py-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Georgia']">
              Join Kings Chops 🍕
            </h2>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />

                <span>
                  {error}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-4">

                {/* First name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    First Name{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />

                    <input
                      type="text"
                      name="firstName"
                      required
                      value={
                        formData.firstName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="John"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                </div>

                {/* Last name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Last Name{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />

                    <input
                      type="text"
                      name="lastName"
                      required
                      value={
                        formData.lastName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Doe"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>
                </div>

              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />

                  <input
                    type="email"
                    name="email"
                    required
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>

                <div className="flex gap-2">

                  <div className="relative w-[150px] shrink-0">
                    <select
                      value={
                        selectedCountry
                      }
                      onChange={
                        handleCountryChange
                      }
                      className="w-full h-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-3 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                    >
                      {countries.map(
                        (
                          country
                        ) => (
                          <option
                            key={
                              country.code
                            }
                            value={
                              country.code
                            }
                          >
                            {
                              country.code
                            }{" "}
                            {
                              country.dialCode
                            }
                          </option>
                        )
                      )}
                    </select>

                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                      ▼
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="801 234 5678"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                  </div>

                </div>

                <p className="text-xs text-gray-400 mt-1.5">
                  Select your country and enter
                  your phone number.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    required
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />

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
                    onChange={
                      handleChange
                    }
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 cursor-pointer"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  required
                  id="terms"
                  className="mt-1 accent-orange-600"
                />

                <label
                  htmlFor="terms"
                  className="text-sm text-gray-500"
                >
                  I agree to the{" "}

                  <a
                    href="#"
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Terms of Service
                  </a>{" "}

                  and{" "}

                  <a
                    href="#"
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Create account */}
              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="w-full bg-linear-to-r from-orange-600 to-rose-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-orange-700 hover:to-rose-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg mt-2"
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

                    Creating account...

                  </span>
                ) : (
                  "Create My Account"
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-200" />

              <span className="px-4 text-sm text-gray-400">
                or
              </span>

              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Google Sign Up */}
            <div
              ref={googleButtonRef}
              className={`w-full flex justify-center ${
                googleLoading
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            />

            {/* Login */}
            <p className="text-center mt-5 text-sm text-gray-500">
              Already have an account?{" "}

              <Link
                to="/login"
                className="text-orange-600 font-semibold hover:text-orange-800 hover:underline"
              >
                Sign in here
              </Link>
            </p>

          </div>
        </div>

        <p className="text-center text-white/70 text-xs mt-4">
          ©{" "}
          {new Date().getFullYear()}{" "}
          Kings Chops. All rights reserved.
        </p>

      </div>
    </div>
  );
}

export default Register;