import React from "react";
import { Routes, Route } from "react-router-dom";

import { CartProvider } from "./CartContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { NotificationProvider } from "./NotificationContext.jsx";

import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentCallback from "./pages/PaymentCallback.jsx";

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
import OrderHistory from "./pages/OrderHistory.jsx";
import ConfirmDelivery from "./pages/ConfirmDelivery.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import NotificationDetailsPage from "./pages/NotificationDetailsPage.jsx";

// Special features
import BuildSnackBox from "./pages/BuildSnackBox.jsx";
import SmartBudget from "./pages/SmartBudget.jsx";
import GroupOrdering from "./pages/GroupOrdering.jsx";
import SurpriseMe from "./pages/SurpriseMe.jsx";

// Auth protection
import ProtectedRoute from "./ProtectedRoute.jsx";

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────

function HomePage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Hero />
      <Main />
      <Partners />
      <Features />
      <Testimonials />
      <Contacts />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH LAYOUT
// ─────────────────────────────────────────────────────────────

function AuthLayout({ children }) {
  return <div>{children}</div>;
}

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <Routes>
            {/* ─────────────────────────────────────────────
                AUTH ROUTES
            ───────────────────────────────────────────── */}

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

            {/* ─────────────────────────────────────────────
                PUBLIC HOME
            ───────────────────────────────────────────── */}

            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                PROTECTED MENU
            ───────────────────────────────────────────── */}

            <Route
              path="/menu"
              element={
                <Layout>
                  <ProtectedRoute>
                    <MenuPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                NOTIFICATIONS
            ───────────────────────────────────────────── */}

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications/:id"
              element={
                <ProtectedRoute>
                  <NotificationDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/payment/callback" element={<PaymentCallback />} />

            {/* ─────────────────────────────────────────────
                PROTECTED SPECIAL FEATURES
            ───────────────────────────────────────────── */}

            <Route
              path="/build-snack-box"
              element={
                <Layout>
                  <ProtectedRoute>
                    <BuildSnackBox />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="/smart-budget"
              element={
                <Layout>
                  <ProtectedRoute>
                    <SmartBudget />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="/group-ordering"
              element={
                <Layout>
                  <ProtectedRoute>
                    <GroupOrdering />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="/surprise-me"
              element={
                <Layout>
                  <ProtectedRoute>
                    <SurpriseMe />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                PUBLIC ABOUT
            ───────────────────────────────────────────── */}

            <Route
              path="/about"
              element={
                <Layout>
                  <About />
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                PROTECTED CONTACT
            ───────────────────────────────────────────── */}

            <Route
              path="/contact"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ContactPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                CART
            ───────────────────────────────────────────── */}

            <Route
              path="/cart"
              element={
                <Layout>
                  <CartPage />
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                PAYMENT
            ───────────────────────────────────────────── */}

            <Route
              path="/payment"
              element={
                <Layout>
                  <PaymentPage />
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                CHECKOUT
            ───────────────────────────────────────────── */}

            <Route path="/checkout" element={<CheckoutPage />} />

            {/* ─────────────────────────────────────────────
                PROTECTED PROFILE
            ───────────────────────────────────────────── */}

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

            {/* ─────────────────────────────────────────────
                PROTECTED ORDER HISTORY
            ───────────────────────────────────────────── */}

            <Route
              path="/order-history"
              element={
                <Layout>
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                PROTECTED DELIVERY CONFIRMATION
            ───────────────────────────────────────────── */}

            <Route
              path="/confirm-delivery/:id"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ConfirmDelivery />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                PROTECTED ORDER TRACKING
            ───────────────────────────────────────────── */}

            <Route
              path="/track-order/:id"
              element={
                <Layout>
                  <ProtectedRoute>
                    <TrackOrder />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* ─────────────────────────────────────────────
                404
            ───────────────────────────────────────────── */}

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
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
