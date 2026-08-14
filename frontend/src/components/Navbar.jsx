import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Menu, ShoppingCart, X, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { useAuth } from "../AuthContext.jsx";

function Navbar() {
  const [header, setHeader] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 50 ? setHeader(true) : setHeader(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <header
      className={`w-full relative z-50 bg-orange-100 border-b border-orange-200 transition-all selection:transparent selection:text-current ${
        header ? "py-3 bg-white shadow-lg" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* ── Mobile Nav ─────────────────────────────────────────────── */}
        <div className="flex md:hidden justify-between items-center">
          <Link to="/" className="font-semibold flex gap-1 items-center">
            <div className="text-yellow-600 text-2xl">
              <FontAwesomeIcon icon={faCrown} />
            </div>
            <h2 className="font-['Georgia'] font-bold text-xl">
              <span className="hover:text-yellow-600">Kings</span>
              <span className="text-yellow-600 ml-1.5 hover:text-black">
                Chops
              </span>
            </h2>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="cursor-pointer text-gray-700 hover:text-orange-600 transition-colors"
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileNavOpen && (
          <ul className="md:hidden p-4 bg-orange-100 rounded-b-xl font-semibold text-lg mt-1 flex flex-col gap-1 text-center border-t border-orange-200">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block py-2 px-4 rounded-lg transition-all ${
                    isActive(link.to)
                      ? "bg-orange-600 text-white"
                      : "hover:text-rose-500 hover:bg-orange-200"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="block py-2 px-4 rounded-lg hover:text-rose-500 hover:bg-orange-200 transition-all"
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 px-4 text-rose-600 font-semibold rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="block mt-2 py-2 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
                >
                  Order Now
                </Link>
              </li>
            )}
          </ul>
        )}

        {/* ── Desktop Nav ─────────────────────────────────────────────── */}
        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="font-semibold flex gap-1 items-center">
            <div className="text-yellow-600 text-3xl">
              <FontAwesomeIcon icon={faCrown} />
            </div>
            <h2 className="font-['Georgia'] font-bold text-2xl">
              <span className="hover:text-yellow-600">Kings</span>
              <span className="text-yellow-600 ml-1.5 hover:text-black">
                Chops
              </span>
            </h2>
          </Link>

          <div className="flex items-center gap-x-6">
            <ul className="flex items-center cursor-pointer gap-6 text-black font-semibold">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`transition-all px-2 py-1 rounded-md ${
                      isActive(link.to)
                        ? "text-rose-500 bg-orange-100"
                        : "hover:text-rose-500 hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-all cursor-pointer"
                >
                  {/* Avatar */}
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.firstName}
                      className="w-7 h-7 rounded-full object-cover border border-orange-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-orange-100 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      My Cart {totalItems > 0 && `(${totalItems})`}
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-rose-500 px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-rose-600 hover:scale-110 transition-all font-semibold"
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
