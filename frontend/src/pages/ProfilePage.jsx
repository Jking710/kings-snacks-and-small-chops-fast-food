import React, { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import {
  User,
  Mail,
  Phone,
  LogOut,
  ShoppingBag,
  Shield,
  Save,
  CheckCircle,
} from "lucide-react";

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleSavePhone = async () => {
    setError("");
    setPhoneSaved(false);

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setSavingPhone(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5173/api/auth/phone",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update phone number."
        );
      }

      setPhone(data.user.phone || phone.trim());
      setPhoneSaved(true);

      // Update the user stored by AuthContext if it exposes
      // a way to update the current user.
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("userUpdated", {
            detail: data.user,
          })
        );
      }

      setTimeout(() => {
        setPhoneSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Phone update error:", error);
      setError(
        error.message ||
          "Could not update phone number. Please try again."
      );
    } finally {
      setSavingPhone(false);
    }
  };

  if (!user) return null;

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header Card */}
        <div className="bg-linear-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-white text-center mb-6 shadow-lg">

          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.firstName}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md bg-orange-700 flex items-center justify-center text-3xl font-bold font-['Georgia']">
              {initials}
            </div>
          )}

          <h1 className="text-2xl font-bold font-['Georgia']">
            Welcome, {user.firstName} 👋
          </h1>

          <p className="text-orange-100 text-sm mt-1">
            {user.email}
          </p>

          <span className="inline-block mt-3 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {user.authProvider === "google"
              ? "🔵 Google Account"
              : "📧 Email Account"}
          </span>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">

          <h2 className="font-bold text-gray-800 font-['Georgia'] text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Account Details
          </h2>

          <div className="space-y-4">

            {/* First Name */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                First Name
              </span>

              <span className="text-sm font-semibold text-gray-800">
                {user.firstName}
              </span>
            </div>

            {/* Last Name */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                Last Name
              </span>

              <span className="text-sm font-semibold text-gray-800">
                {user.lastName}
              </span>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </span>

              <span className="text-sm font-semibold text-gray-800 break-all ml-4">
                {user.email}
              </span>
            </div>

            {/* PHONE NUMBER */}
            <div className="py-4 border-b border-gray-100">

              <label className="text-sm text-gray-500 font-medium flex items-center gap-1 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>

              <div className="flex flex-col sm:flex-row gap-2">

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneSaved(false);
                    setError("");
                  }}
                  placeholder="Enter your phone number"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />

                <button
                  type="button"
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    savingPhone
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
                  }`}
                >
                  {savingPhone ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>

              </div>

              {/* Success message */}
              {phoneSaved && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-3">
                  <CheckCircle className="w-4 h-4" />
                  Phone number saved successfully.
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-red-500 text-sm font-medium mt-3">
                  {error}
                </p>
              )}

            </div>

            {/* Sign-in Method */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">

              <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Sign-in Method
              </span>

              <span className="text-sm font-semibold text-gray-800 capitalize">
                {user.authProvider}
              </span>

            </div>

            {/* Member Since */}
            <div className="flex justify-between items-center py-3">

              <span className="text-sm text-gray-500 font-medium">
                Member Since
              </span>

              <span className="text-sm font-semibold text-gray-800">
                {new Date(user.createdAt).toLocaleDateString(
                  "en-NG",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>

            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          <Link
            to="/menu"
            className="flex items-center justify-center gap-2 bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-700 transition-all hover:scale-[1.02] text-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Menu
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-white border-2 border-rose-200 text-rose-600 py-3 px-6 rounded-xl font-semibold hover:bg-rose-50 transition-all hover:scale-[1.02] text-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

        </div>

        {/* Back to home */}
        <div className="text-center">

          <Link
            to="/"
            className="text-sm text-orange-600 hover:underline font-medium flex items-center justify-center gap-1"
          >
            <FontAwesomeIcon
              icon={faCrown}
              className="text-yellow-600 text-xs"
            />

            Back to Kings Chops
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ProfilePage;