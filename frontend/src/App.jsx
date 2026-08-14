import React from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./CartContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Layout components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Landing page sections
import Hero from "./components/Hero.jsx";
import Main from "./components/Main.jsx";
import Partners from "./components/Partners.jsx";
import Features from "./components/keyFeatures.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Contacts from "./components/Contact.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Auth protection
import ProtectedRoute from "./ProtectedRoute.jsx";

// Home page — all landing sections
function HomePage() {
  return (
    <>
      <Hero />
      <Main />
      <Partners />
      <Features />
      <Testimonials />
      <Contacts />
    </>
  );
}

// Layout with Navbar + Footer
function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Auth pages — no Navbar/Footer
function AuthLayout({ children }) {
  return <div>{children}</div>;
}

function App() {
  return (
    // AuthProvider wraps everything so all components can access auth state
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* ── Auth routes (no navbar) ─────────────────────────────── */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <AuthLayout>
                <VerifyOTP />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            }
          />

          {/* ── Public routes (with navbar) ─────────────────────────── */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/menu"
            element={
              <Layout>
                <MenuPage />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <ContactPage />
              </Layout>
            }
          />
          <Route
            path="/cart"
            element={
              <Layout>
                <CartPage />
              </Layout>
            }
          />

          {/* ── Protected routes — must be logged in ────────────────── */}
          <Route
            path="/profile"
            element={
              <Layout>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Layout>
            }
          />

          {/* ── 404 fallback ────────────────────────────────────────── */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                  <p className="text-8xl mb-4">🍕</p>
                  <h2 className="text-3xl font-bold font-['Georgia'] text-gray-800 mb-2">
                    Page Not Found
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Looks like this page went out for delivery and never came
                    back.
                  </p>
                  <a
                    href="/"
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all hover:scale-105"
                  >
                    Go Back Home
                  </a>
                </div>
              </Layout>
            }
          />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
