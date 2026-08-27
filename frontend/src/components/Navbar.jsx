import React, { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

import {
  Menu,
  ShoppingCart,
  X,
  User,
  LogOut,
  ChevronDown,
  Bell,
  ClipboardList,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../CartContext.jsx";
import { useAuth } from "../AuthContext.jsx";

import { useNotifications } from "../NotificationContext.jsx";

import NotificationDropdown from "../components/NotificationDropdown.jsx";

function Navbar() {
  const [header, setHeader] = useState(false);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notificationPopup, setNotificationPopup] = useState(null);

  // Controls Special Features dropdown
  const [specialFeaturesOpen, setSpecialFeaturesOpen] = useState(false);

  const notificationRef = useRef(null);

  const userMenuRef = useRef(null);

  const specialFeaturesRef = useRef(null);

  const popupTimerRef = useRef(null);

  const { totalItems } = useCart();

  const { isAuthenticated, user, logout } = useAuth();

  const { unreadCount, fetchNotifications } = useNotifications();

  const location = useLocation();

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // HEADER SCROLL
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      setHeader(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ─────────────────────────────────────────────
  // CLOSE MENUS WHEN ROUTE CHANGES
  // ─────────────────────────────────────────────

  useEffect(() => {
    setMobileNavOpen(false);
    setUserMenuOpen(false);
    setNotificationOpen(false);
    setSpecialFeaturesOpen(false);
  }, [location]);

  // ─────────────────────────────────────────────
  // CLOSE DROPDOWNS OUTSIDE
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }

      if (
        specialFeaturesRef.current &&
        !specialFeaturesRef.current.contains(event.target)
      ) {
        setSpecialFeaturesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ─────────────────────────────────────────────
  // SHOW LOGIN / WELCOME NOTIFICATION
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotificationPopup(null);
      return;
    }

    let cancelled = false;

    const loadUserNotifications = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (cancelled) return;

        const list = await fetchNotifications();

        if (cancelled || !Array.isArray(list) || list.length === 0) {
          return;
        }

        const newestUnread = list.find((notification) => !notification.isRead);

        if (!newestUnread) {
          return;
        }

        const notificationId = newestUnread._id;

        const shownKey = `kings-chops-notification-${notificationId}`;

        if (sessionStorage.getItem(shownKey)) {
          return;
        }

        sessionStorage.setItem(shownKey, "true");

        setNotificationPopup(newestUnread);

        if (popupTimerRef.current) {
          clearTimeout(popupTimerRef.current);
        }

        popupTimerRef.current = setTimeout(() => {
          setNotificationPopup(null);
        }, 6000);
      } catch (error) {
        console.error("Failed to load login notification:", error);
      }
    };

    loadUserNotifications();

    return () => {
      cancelled = true;

      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [isAuthenticated, user, fetchNotifications]);

  // ─────────────────────────────────────────────
  // PROTECTED NAVIGATION
  // ─────────────────────────────────────────────

  const handleProtectedNavigation = (path) => {
    setSpecialFeaturesOpen(false);
    setMobileNavOpen(false);

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: {
            pathname: path,
          },
        },
      });

      return;
    }

    navigate(path);
  };

  // ─────────────────────────────────────────────
  // SPECIAL FEATURES DROPDOWN
  // ─────────────────────────────────────────────

  const handleSpecialFeaturesClick = () => {
    if (!isAuthenticated) {
      setSpecialFeaturesOpen(false);
      setMobileNavOpen(false);

      navigate("/login", {
        state: {
          from: {
            pathname: "/build-snack-box",
          },
        },
      });

      return;
    }

    setSpecialFeaturesOpen((previous) => !previous);
  };

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────

  const handleLogout = async () => {
    setNotificationPopup(null);

    setNotificationOpen(false);

    setUserMenuOpen(false);

    setSpecialFeaturesOpen(false);

    setMobileNavOpen(false);

    await logout();

    navigate("/");
  };

  // ─────────────────────────────────────────────
  // ACTIVE LINK
  // ─────────────────────────────────────────────

  const isActive = (path) => location.pathname === path;

  // ─────────────────────────────────────────────
  // NAVIGATION LINKS
  // ─────────────────────────────────────────────

  const navLinks = [
    {
      label: "Home",
      to: "/",
      protected: false,
    },
    {
      label: "Menu",
      to: "/menu",
      protected: true,
    },
    {
      label: "About",
      to: "/about",
      protected: false,
    },
    {
      label: "Contact",
      to: "/contact",
      protected: true,
    },
  ];

  // ─────────────────────────────────────────────
  // USER INITIALS
  // ─────────────────────────────────────────────

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <header
      className={`w-full relative z-50 bg-[#f6eee8] border-b border-[#ead9cd] transition-all selection:transparent selection:text-current ${
        header ? "py-3 bg-[#fffdfb] shadow-lg" : "py-5"
      }`}
    >
      {/* ======================================================
          NOTIFICATION POPUP
      ====================================================== */}

      {notificationPopup && (
        <div className="fixed top-5 right-5 z-100 w-[min(380px,calc(100vw-32px))]">
          <div className="bg-white border border-[#ead9cd] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-[#f6eee8] text-[#8b563b] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9a5f3d]">
                      Notification
                    </p>

                    <h3 className="font-bold text-gray-800 mt-1">
                      {notificationPopup.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationPopup(null)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {notificationPopup.message}
                </p>

                <Link
                  to={
                    notificationPopup.link ||
                    `/notifications/${notificationPopup._id}`
                  }
                  onClick={() => setNotificationPopup(null)}
                  className="inline-block mt-3 text-sm font-semibold text-[#8b563b] hover:text-[#5a3825]"
                >
                  View notification
                </Link>
              </div>
            </div>

            <div className="h-1 bg-[#ead9cd]">
              <div className="h-full bg-[#9a5f3d] animate-[shrink_6s_linear]" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* ======================================================
            MOBILE NAV
        ====================================================== */}

        <div className="flex md:hidden justify-between items-center">
          <Link to="/" className="font-semibold flex gap-1 items-center">
            <div className="text-[#8b563b] text-2xl">
              <FontAwesomeIcon icon={faCrown} />
            </div>

            <h2 className="font-['Georgia'] font-bold text-xl">
              <span className="hover:text-[#8b563b]">Kings</span>

              <span className="text-[#8b563b] ml-1.5 hover:text-[#3b2418]">
                Chops
              </span>
            </h2>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-[#8b563b] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#9a5f3d] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileNavOpen((previous) => !previous)}
              className="cursor-pointer text-gray-700 hover:text-[#8b563b] transition-colors"
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================
            MOBILE MENU
        ====================================================== */}

        {mobileNavOpen && (
          <ul className="md:hidden p-4 bg-[#f6eee8] rounded-b-xl font-semibold text-lg mt-1 flex flex-col gap-1 text-center border-t border-[#ead9cd]">
            {navLinks.map((link) => (
              <li key={link.to}>
                {link.protected ? (
                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation(link.to)}
                    className={`w-full block py-2 px-4 rounded-lg transition-all ${
                      isActive(link.to)
                        ? "bg-[#7a4a2d] text-white"
                        : "hover:text-[#8b563b] hover:bg-[#ead9cd]"
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    to={link.to}
                    className={`block py-2 px-4 rounded-lg transition-all ${
                      isActive(link.to)
                        ? "bg-[#7a4a2d] text-white"
                        : "hover:text-[#8b563b] hover:bg-[#ead9cd]"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}

            {/* MOBILE SPECIAL FEATURES */}

            <li className="mt-1">
              <button
                type="button"
                onClick={() => handleSpecialFeaturesClick()}
                className="w-full py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd] cursor-pointer"
              >
                Special Features
              </button>

              {isAuthenticated && specialFeaturesOpen && (
                <div className="flex flex-col gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleProtectedNavigation("/build-snack-box")
                    }
                    className="block py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    Build Your Snack Box
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation("/smart-budget")}
                    className="block py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    Smart Budget
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation("/group-ordering")}
                    className="block py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    Group Ordering
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation("/surprise-me")}
                    className="block py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    Surprise Me Order
                  </button>
                </div>
              )}
            </li>

            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="block py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    My Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="/order-history"
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    <ClipboardList size={19} />
                    Order History
                  </Link>
                </li>

                <li>
                  <Link
                    to="/notifications"
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:text-[#8b563b] hover:bg-[#ead9cd]"
                  >
                    <Bell size={19} />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-[#9a5f3d] text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 px-4 text-[#8b563b] font-semibold rounded-lg hover:bg-[#f3e1d8] transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="block mt-2 py-2 px-4 bg-[#7a4a2d] text-white rounded-lg hover:bg-[#5a3825]"
                >
                  Order Now
                </Link>
              </li>
            )}
          </ul>
        )}

        {/* ======================================================
            DESKTOP NAV
        ====================================================== */}

        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="font-semibold flex gap-1 items-center">
            <div className="text-[#8b563b] text-3xl">
              <FontAwesomeIcon icon={faCrown} />
            </div>

            <h2 className="font-['Georgia'] font-bold text-2xl">
              <span className="hover:text-[#8b563b]">Kings</span>

              <span className="text-[#8b563b] ml-1.5 hover:text-[#3b2418]">
                Chops
              </span>
            </h2>
          </Link>

          <div className="flex items-center gap-x-6">
            <ul className="flex items-center cursor-pointer gap-6 text-[#3b2418] font-semibold">
              {/* HOME, MENU, ABOUT, CONTACT */}

              {navLinks.map((link) => (
                <li key={link.to}>
                  {link.protected ? (
                    <button
                      type="button"
                      onClick={() => handleProtectedNavigation(link.to)}
                      className={`transition-all px-2 py-1 rounded-md cursor-pointer ${
                        isActive(link.to)
                          ? "text-[#8b563b] bg-[#f6eee8]"
                          : "hover:text-[#8b563b] hover:bg-black/5"
                      }`}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.to}
                      className={`transition-all px-2 py-1 rounded-md ${
                        isActive(link.to)
                          ? "text-[#8b563b] bg-[#f6eee8]"
                          : "hover:text-[#8b563b] hover:bg-black/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}

              {/* ==================================================
                  SPECIAL FEATURES
              ================================================== */}

              <li ref={specialFeaturesRef} className="relative">
                <button
                  type="button"
                  onClick={handleSpecialFeaturesClick}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                    isActive("/build-snack-box") ||
                    isActive("/smart-budget") ||
                    isActive("/group-ordering") ||
                    isActive("/surprise-me")
                      ? "text-[#8b563b] bg-[#f6eee8]"
                      : "hover:text-[#8b563b] hover:bg-black/5"
                  }`}
                >
                  Special Features
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      specialFeaturesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAuthenticated && specialFeaturesOpen && (
                  <div className="absolute left-0 top-full pt-3 w-64 z-50">
                    <div className="bg-white border border-[#ead9cd] rounded-xl shadow-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          handleProtectedNavigation("/build-snack-box")
                        }
                        className="w-full text-left block px-4 py-4 text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <p className="font-bold text-sm">
                          Build Your Snack Box
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Create your own snack box.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleProtectedNavigation("/smart-budget")
                        }
                        className="w-full text-left block px-4 py-4 border-t border-gray-100 text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <p className="font-bold text-sm">Smart Budget</p>

                        <p className="text-xs text-gray-400 mt-1">
                          Find snacks within your budget.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleProtectedNavigation("/group-ordering")
                        }
                        className="w-full text-left block px-4 py-4 border-t border-gray-100 text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <p className="font-bold text-sm">Group Ordering</p>

                        <p className="text-xs text-gray-400 mt-1">
                          Order snacks with friends.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleProtectedNavigation("/surprise-me")
                        }
                        className="w-full text-left block px-4 py-4 border-t border-gray-100 text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <p className="font-bold text-sm">Surprise Me Order</p>

                        <p className="text-xs text-gray-400 mt-1">
                          Having trouble ordering? Don't worry, we got you
                          covered.
                        </p>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            </ul>

            {/* CART */}

            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-[#8b563b] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#9a5f3d] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* AUTH */}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* PROFILE */}

                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen((previous) => !previous);

                      setNotificationOpen(false);
                    }}
                    className="flex items-center gap-2 bg-[#f6eee8] border border-[#ead9cd] px-3 py-1.5 rounded-xl hover:bg-[#ead9cd] transition-all cursor-pointer"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.firstName}
                        className="w-7 h-7 rounded-full object-cover border border-[#c89576]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#7a4a2d] text-white flex items-center justify-center text-xs font-bold">
                        {initials}
                      </div>
                    )}

                    <span className="text-sm font-semibold text-gray-700">
                      {user.firstName}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#ead9cd] rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>

                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        My Cart
                        {totalItems > 0 && ` (${totalItems})`}
                      </Link>

                      <Link
                        to="/order-history"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b] ${
                          isActive("/order-history")
                            ? "bg-[#f6eee8] text-[#8b563b]"
                            : ""
                        }`}
                      >
                        <ClipboardList className="w-4 h-4" />
                        Order History
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#8b563b] hover:bg-[#f3e1d8] transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* NOTIFICATIONS */}

                <div ref={notificationRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen((previous) => !previous);

                      setUserMenuOpen(false);
                    }}
                    aria-label="Notifications"
                    aria-expanded={notificationOpen}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      notificationOpen
                        ? "bg-[#f6eee8] border-[#c89576] text-[#8b563b]"
                        : "bg-white border-[#ead9cd] text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                    }`}
                  >
                    <Bell
                      className={`w-5 h-5 ${
                        unreadCount > 0 ? "animate-pulse" : ""
                      }`}
                    />

                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#9a5f3d] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <NotificationDropdown
                      onClose={() => setNotificationOpen(false)}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-linear-to-r from-[#5a3825] via-[#7a4a2d] to-[#9a5f3d] px-4 py-2 rounded-lg text-white cursor-pointer hover:from-[#4a2d20] hover:via-[#693f29] hover:to-[#875034] hover:scale-110 transition-all font-semibold"
              >
                Order Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
