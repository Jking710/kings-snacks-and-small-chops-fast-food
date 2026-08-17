import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderData = location.state;

  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState("");

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-[#8b5e3c] mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-[#3b2418] font-['Georgia'] mb-2">
            No order found
          </h2>

          <p className="text-gray-500 mb-6">
            Please return to your cart and start checkout again.
          </p>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 bg-linear-to-r from-[#4a2c1d] to-[#7a4a2d] text-white px-6 py-3 rounded-xl font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  const {
    cartItems = [],
    totalPrice = 0,
    deliveryFee = 0,
    grandTotal = 0,
  } = orderData;

  const handleContinueToPayment = (e) => {
    e.preventDefault();

    setError("");

    const cleanPhone = phone.trim();
    const cleanAddress = deliveryAddress.trim();

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!cleanAddress) {
      setError("Please enter your delivery address.");
      return;
    }

    if (cleanAddress.length < 10) {
      setError("Please enter a complete delivery address.");
      return;
    }

    navigate("/payment", {
      state: {
        cartItems,
        totalPrice,
        deliveryFee,
        grandTotal,
        phone: cleanPhone,
        deliveryAddress: cleanAddress,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-[#ead9cb] hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />

            <h1 className="text-3xl font-bold font-['Georgia']">
              Checkout
            </h1>
          </div>

          <p className="text-[#ead9cb] mt-2 text-sm">
            Enter your delivery details before payment.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleContinueToPayment}
              className="bg-white rounded-2xl border border-[#e8ddd5] shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-[#3b2418] font-['Georgia'] mb-6">
                Delivery Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b5e3c]" />

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e5d8cf] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] focus:border-[#b8957e]"
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    We will use this number to contact you about your
                    delivery.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Delivery Address
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#8b5e3c]" />

                    <textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) =>
                        setDeliveryAddress(e.target.value)
                      }
                      placeholder="Enter your full delivery address"
                      rows={5}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#e5d8cf] text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#c7ad9b] focus:border-[#b8957e]"
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Include your street, building number, estate,
                    landmark, or other useful delivery details.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-[#4a2c1d] via-[#5a3825] to-[#7a4a2d] text-white py-3 rounded-xl font-bold hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8ddd5] sticky top-24">
              <h3 className="font-bold text-gray-800 text-lg font-['Georgia'] mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3"
                  >
                    <span className="truncate">
                      {item.name} ×{item.quantity}
                    </span>

                    <span className="font-medium text-gray-700 whitespace-nowrap">
                      ₦
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>

                  <span>
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>

                  <span>
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-gray-800 text-base pt-3 border-t border-gray-100">
                  <span>Total</span>

                  <span className="text-[#6b4226]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#f3ebe5] rounded-xl p-3 mt-5 text-xs text-[#6b4226]">
                🚚 Estimated delivery:{" "}
                <strong>30–45 minutes</strong>
                <br />
                📍 Delivering within Lagos Island & Mainland, Port-Harcourt and Abuja
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
