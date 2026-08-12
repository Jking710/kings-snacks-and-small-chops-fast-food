import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../useCart.js";

function Navbar() {
  const [header, setHeader] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 50 ? setHeader(true) : setHeader(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`z-50 *: top-0 bg-orange-100 border-b border-orange-200 transition-all selection:transparent selection:text-current ${
        header ? "py-3 bg-white shadow-lg" : "py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Mobile Nav */}
        <div className="flex md:hidden justify-between items-center px-4">
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
            <li>
              <Link
                to="/login"
                className="block mt-2 py-2 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
              >
                Order Now
              </Link>
            </li>
          </ul>
        )}

        {/* Desktop Nav */}
        <div className="hidden md:flex justify-between items-center px-10">
          <Link
            to="/"
            className="font-semibold flex gap-1 items-center cursor-default"
          >
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
                        ? "text-rose-500 bg-orange-100 px-2 py-1"
                        : "hover:text-rose-500 hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cart Icon */}
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

            <Link
              to="/login"
              className="bg-rose-500 px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-rose-600 hover:text-black hover:scale-110 transition-all font-semibold"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
