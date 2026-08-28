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
  const [specialFeaturesOpen, setSpecialFeaturesOpen] = useState(false);
  const [mobileSpecialFeaturesOpen, setMobileSpecialFeaturesOpen] =
    useState(false);

  const notificationRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const desktopUserMenuRef = useRef(null);
  const specialFeaturesRef = useRef(null);
  const popupTimerRef = useRef(null);

  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount, fetchNotifications } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setHeader(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    setUserMenuOpen(false);
    setNotificationOpen(false);
    setSpecialFeaturesOpen(false);
    setMobileSpecialFeaturesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }

      if (
        desktopUserMenuRef.current &&
        !desktopUserMenuRef.current.contains(event.target)
      ) {
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotificationPopup(null);
      return undefined;
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

        const newestUnread = list.find(
          (notification) => !notification.isRead
        );

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

  const closeMenus = () => {
    setMobileNavOpen(false);
    setUserMenuOpen(false);
    setNotificationOpen(false);
    setSpecialFeaturesOpen(false);
    setMobileSpecialFeaturesOpen(false);
  };

  const handleProtectedNavigation = (path) => {
    closeMenus();

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

  const handleMobileMenuNavigation = (path) => {
    setUserMenuOpen(false);
    setMobileNavOpen(false);
    setMobileSpecialFeaturesOpen(false);

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

  const handleSpecialFeaturesClick = () => {
    if (!isAuthenticated) {
      closeMenus();

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

  const handleMobileSpecialFeaturesClick = () => {
    if (!isAuthenticated) {
      setMobileSpecialFeaturesOpen(false);
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

    setMobileSpecialFeaturesOpen((previous) => !previous);
  };

  const handleLogout = async () => {
    closeMenus();
    setNotificationPopup(null);

    await logout();

    navigate("/");
  };

  const handleMobileProfileClick = () => {
    setUserMenuOpen((previous) => !previous);
    setNotificationOpen(false);
  };

  const handleMobileNotificationClick = () => {
    setMobileNavOpen(false);
    setUserMenuOpen(false);
    setMobileSpecialFeaturesOpen(false);
    setNotificationOpen(false);

    navigate("/notifications");
  };

  const isActive = (path) => location.pathname === path;

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

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  const mobileProfileInitial = user?.firstName?.[0]?.toUpperCase() || "U";

  const specialFeaturePaths = [
    "/build-snack-box",
    "/smart-budget",
    "/group-ordering",
    "/surprise-me",
  ];

  const specialFeatureLabels = {
    "/build-snack-box": "Build Your Snack Box",
    "/smart-budget": "Smart Budget",
    "/group-ordering": "Group Ordering",
    "/surprise-me": "Surprise Me Order",
  };

  return (
    <header
      className={`relative z-50 w-full border-b border-[#ead9cd] bg-[#f6eee8] transition-all ${
        header ? "bg-[#fffdfb] py-3 shadow-lg" : "py-5"
      }`}
    >
      {notificationPopup && (
        <div className="fixed right-5 top-5 z-100 w-[min(380px,calc(100vw-32px))]">
          <div className="overflow-hidden rounded-2xl border border-[#ead9cd] bg-white shadow-2xl">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6eee8] text-[#8b563b]">
                <Bell className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9a5f3d]">
                      Notification
                    </p>

                    <h3 className="mt-1 font-bold text-gray-800">
                      {notificationPopup.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationPopup(null)}
                    className="cursor-pointer text-gray-400 hover:text-gray-700"
                    aria-label="Close notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {notificationPopup.message}
                </p>

                <Link
                  to={
                    notificationPopup.link ||
                    `/notifications/${notificationPopup._id}`
                  }
                  onClick={() => setNotificationPopup(null)}
                  className="mt-3 inline-block text-sm font-semibold text-[#8b563b] hover:text-[#5a3825]"
                >
                  View notification
                </Link>
              </div>
            </div>

            <div className="h-1 bg-[#ead9cd]">
              <div className="h-full animate-[shrink_6s_linear] bg-[#9a5f3d]" />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 md:px-10">
        {/* ======================================================
            MOBILE HEADER
        ====================================================== */}

        <div className="flex items-center justify-between md:hidden">
          <Link to="/" className="flex items-center gap-1 font-semibold">
            <div className="text-2xl text-[#8b563b]">
              <FontAwesomeIcon icon={faCrown} />
            </div>

            <h2 className="font-['Georgia'] text-xl font-bold">
              <span className="hover:text-[#8b563b]">Kings</span>

              <span className="ml-1.5 text-[#8b563b] hover:text-[#3b2418]">
                Chops
              </span>
            </h2>
          </Link>

          <div className="flex items-center gap-3">
            {/* MOBILE PROFILE BUTTON */}

            {isAuthenticated && user ? (
              <div ref={mobileUserMenuRef} className="relative">
                <button
                  type="button"
                  onClick={handleMobileProfileClick}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                    userMenuOpen
                      ? "border-[#8b563b] bg-[#7a4a2d] text-white"
                      : "border-[#c89576] bg-[#7a4a2d] text-white hover:bg-[#5a3825]"
                  }`}
                  aria-label="Open profile menu"
                  aria-expanded={userMenuOpen}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.firstName || "User"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {mobileProfileInitial}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#ead9cd] bg-white py-2 text-left shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.firstName || "User"}
                            className="h-9 w-9 rounded-full border border-[#c89576] object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7a4a2d] text-sm font-bold text-white">
                            {mobileProfileInitial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMobileMenuNavigation("/profile")}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileMenuNavigation("/cart")}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      My Cart

                      {totalItems > 0 && (
                        <span className="ml-auto rounded-full bg-[#9a5f3d] px-2 py-0.5 text-xs font-bold text-white">
                          {totalItems}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleMobileMenuNavigation("/order-history")
                      }
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Order History
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* MOBILE NOTIFICATIONS */}

            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={handleMobileNotificationClick}
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-[#ead9cd] hover:text-[#8b563b]"
                aria-label="Notifications"
              >
                <Bell
                  className={`h-5 w-5 ${
                    unreadCount > 0 ? "animate-pulse" : ""
                  }`}
                />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9a5f3d] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ) : null}

            {/* MOBILE CART */}

            <Link
              to="/cart"
              className="relative text-gray-700 transition-colors hover:text-[#8b563b]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />

              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#9a5f3d] text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() => {
                setMobileNavOpen((previous) => !previous);
                setMobileSpecialFeaturesOpen(false);
                setUserMenuOpen(false);
              }}
              className="cursor-pointer text-gray-700 transition-colors hover:text-[#8b563b]"
              aria-label="Toggle mobile navigation"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================
            MOBILE MENU
        ====================================================== */}

        {mobileNavOpen && (
          <ul className="mt-1 flex flex-col gap-1 rounded-b-xl border-t border-[#ead9cd] bg-[#f6eee8] p-4 text-center text-lg font-semibold md:hidden">
            {navLinks.map((link) => (
              <li key={link.to}>
                {link.protected ? (
                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation(link.to)}
                    className={`block w-full rounded-lg px-4 py-2 transition-all ${
                      isActive(link.to)
                        ? "bg-[#7a4a2d] text-white"
                        : "hover:bg-[#ead9cd] hover:text-[#8b563b]"
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    to={link.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={`block rounded-lg px-4 py-2 transition-all ${
                      isActive(link.to)
                        ? "bg-[#7a4a2d] text-white"
                        : "hover:bg-[#ead9cd] hover:text-[#8b563b]"
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
                onClick={handleMobileSpecialFeaturesClick}
                className={`flex w-full items-center justify-center gap-1 rounded-lg px-4 py-2 transition-all ${
                  mobileSpecialFeaturesOpen
                    ? "bg-[#ead9cd] text-[#8b563b]"
                    : "hover:bg-[#ead9cd] hover:text-[#8b563b]"
                }`}
                aria-expanded={mobileSpecialFeaturesOpen}
              >
                <span>Special Features</span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileSpecialFeaturesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isAuthenticated && mobileSpecialFeaturesOpen && (
                <div className="mt-1 flex flex-col gap-1 px-2">
                  {specialFeaturePaths.map((path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => handleProtectedNavigation(path)}
                      className="w-full rounded-lg px-4 py-2 text-base transition-all hover:bg-[#ead9cd] hover:text-[#8b563b]"
                    >
                      {specialFeatureLabels[path]}
                    </button>
                  ))}
                </div>
              )}
            </li>

            {/* MOBILE AUTH LINKS */}

            {isAuthenticated ? (
              <>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-4 py-2 font-semibold text-[#8b563b] transition-all hover:bg-[#f3e1d8]"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-2 block rounded-lg bg-[#7a4a2d] px-4 py-2 text-white hover:bg-[#5a3825]"
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

        <div className="hidden items-center justify-between md:flex">
          <Link to="/" className="flex items-center gap-1 font-semibold">
            <div className="text-3xl text-[#8b563b]">
              <FontAwesomeIcon icon={faCrown} />
            </div>

            <h2 className="font-['Georgia'] text-2xl font-bold">
              <span className="hover:text-[#8b563b]">Kings</span>

              <span className="ml-1.5 text-[#8b563b] hover:text-[#3b2418]">
                Chops
              </span>
            </h2>
          </Link>

          <div className="flex items-center gap-x-6">
            <ul className="flex items-center gap-6 font-semibold text-[#3b2418]">
              {navLinks.map((link) => (
                <li key={link.to}>
                  {link.protected ? (
                    <button
                      type="button"
                      onClick={() => handleProtectedNavigation(link.to)}
                      className={`cursor-pointer rounded-md px-2 py-1 transition-all ${
                        isActive(link.to)
                          ? "bg-[#f6eee8] text-[#8b563b]"
                          : "hover:bg-black/5 hover:text-[#8b563b]"
                      }`}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.to}
                      className={`rounded-md px-2 py-1 transition-all ${
                        isActive(link.to)
                          ? "bg-[#f6eee8] text-[#8b563b]"
                          : "hover:bg-black/5 hover:text-[#8b563b]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}

              {/* DESKTOP SPECIAL FEATURES */}

              <li ref={specialFeaturesRef} className="relative">
                <button
                  type="button"
                  onClick={handleSpecialFeaturesClick}
                  className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-all ${
                    specialFeaturePaths.some((path) => isActive(path))
                      ? "bg-[#f6eee8] text-[#8b563b]"
                      : "hover:bg-black/5 hover:text-[#8b563b]"
                  }`}
                  aria-expanded={specialFeaturesOpen}
                >
                  Special Features

                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      specialFeaturesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAuthenticated && specialFeaturesOpen && (
                  <div className="absolute left-0 top-full z-50 w-64 pt-3">
                    <div className="overflow-hidden rounded-xl border border-[#ead9cd] bg-white shadow-xl">
                      {[
                        {
                          path: "/build-snack-box",
                          title: "Build Your Snack Box",
                          description: "Create your own snack box.",
                        },
                        {
                          path: "/smart-budget",
                          title: "Smart Budget",
                          description: "Find snacks within your budget.",
                        },
                        {
                          path: "/group-ordering",
                          title: "Group Ordering",
                          description: "Order snacks with friends.",
                        },
                        {
                          path: "/surprise-me",
                          title: "Surprise Me Order",
                          description:
                            "Having trouble ordering? Don't worry, we got you covered.",
                        },
                      ].map((feature, index) => (
                        <button
                          key={feature.path}
                          type="button"
                          onClick={() =>
                            handleProtectedNavigation(feature.path)
                          }
                          className={`block w-full px-4 py-4 text-left text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b] ${
                            index > 0 ? "border-t border-gray-100" : ""
                          }`}
                        >
                          <p className="text-sm font-bold">
                            {feature.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {feature.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            </ul>

            {/* DESKTOP CART */}

            <Link
              to="/cart"
              className="relative text-gray-700 transition-colors hover:text-[#8b563b]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />

              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#9a5f3d] text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* DESKTOP AUTH */}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div ref={desktopUserMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen((previous) => !previous);
                      setNotificationOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#ead9cd] bg-[#f6eee8] px-3 py-1.5 transition-all hover:bg-[#ead9cd]"
                    aria-expanded={userMenuOpen}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.firstName || "User"}
                        className="h-7 w-7 rounded-full border border-[#c89576] object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a4a2d] text-xs font-bold text-white">
                        {initials}
                      </div>
                    )}

                    <span className="text-sm font-semibold text-gray-700">
                      {user.firstName}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#ead9cd] bg-white py-2 shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-2">
                        <p className="text-xs text-gray-500">
                          Signed in as
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-800">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                      >
                        <ShoppingCart className="h-4 w-4" />
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
                        <ClipboardList className="h-4 w-4" />
                        Order History
                      </Link>

                      <div className="mt-1 border-t border-gray-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-[#8b563b] transition-colors hover:bg-[#f3e1d8]"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* DESKTOP NOTIFICATIONS */}

                <div ref={notificationRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen((previous) => !previous);
                      setUserMenuOpen(false);
                    }}
                    className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all ${
                      notificationOpen
                        ? "border-[#c89576] bg-[#f6eee8] text-[#8b563b]"
                        : "border-[#ead9cd] bg-white text-gray-700 hover:bg-[#f6eee8] hover:text-[#8b563b]"
                    }`}
                    aria-label="Notifications"
                    aria-expanded={notificationOpen}
                  >
                    <Bell
                      className={`h-5 w-5 ${
                        unreadCount > 0 ? "animate-pulse" : ""
                      }`}
                    />

                    {unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#9a5f3d] px-1 text-[10px] font-bold text-white">
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
                className="rounded-lg bg-linear-to-r from-[#5a3825] via-[#7a4a2d] to-[#9a5f3d] px-4 py-2 font-semibold text-white transition-all hover:scale-110 hover:from-[#4a2d20] hover:via-[#693f29] hover:to-[#875034]"
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