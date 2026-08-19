import React, { useState } from "react";

import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ImageOff,
} from "lucide-react";

import { useCart } from "../CartContext.jsx";
import { Link, useNavigate } from "react-router-dom";

function CartItemImage({ item }) {
  const [imageError, setImageError] = useState(false);

  if (!item.img || imageError) {
    return (
      <div className="w-20 h-20 rounded-xl bg-[#f3ebe5] flex items-center justify-center shrink-0">
        <ImageOff className="w-8 h-8 text-[#b99680]" />
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded-xl bg-[#f3ebe5] overflow-hidden shrink-0">
      <img
        src={item.img}
        alt={item.name}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  const deliveryFee =
    cartItems.length > 0 ? 500 : 0;

  const grandTotal =
    totalPrice + deliveryFee;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    navigate("/checkout", {
      state: {
        cartItems,
        totalPrice,
        deliveryFee,
        grandTotal,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">

      <div className="bg-linear-to-br from-[#3b2418] via-[#5a3825] to-[#7a4a2d] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">

          <Link
            to="/menu"
            className="flex items-center gap-2 text-[#ead9cb] hover:text-white mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>

          <div className="flex items-center gap-3">

            <ShoppingCart className="w-8 h-8" />

            <h1 className="text-3xl font-bold font-['Georgia']">
              Your Cart{" "}

              {totalItems > 0 && (
                <span className="text-[#e8cdb9]">
                  ({totalItems} items)
                </span>
              )}
            </h1>

          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {cartItems.length === 0 ? (

          <div className="text-center py-20">

            <ShoppingCart className="w-20 h-20 text-[#d8c4b4] mx-auto mb-4" />

            <h3 className="text-xl font-bold text-gray-700 font-['Georgia'] mb-2">
              Your cart is empty
            </h3>

            <p className="text-gray-500 mb-6">
              Looks like you haven't added anything yet.
              Let's fix that!
            </p>

            <Link
              to="/menu"
              className="inline-block bg-linear-to-r from-[#4a2c1d] to-[#7a4a2d] text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all"
            >
              Browse Menu
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-4">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8ddd5] flex items-center gap-4 hover:shadow-md transition-all"
                >

                  <CartItemImage item={item} />

                  <div className="flex-1 min-w-0">

                    <h3 className="font-bold text-gray-800 text-sm font-['Georgia'] truncate">
                      {item.name}
                    </h3>

                    <p className="text-[#6b4226] font-semibold text-sm mt-0.5">
                      ₦
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString()}
                    </p>

                    <p className="text-gray-400 text-xs">
                      ₦{item.price.toLocaleString()} each
                    </p>

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      className="w-8 h-8 rounded-full bg-[#f3ebe5] text-[#6b4226] flex items-center justify-center hover:bg-[#e8d9ce] transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-6 text-center font-bold text-gray-700">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className="w-8 h-8 rounded-full bg-[#f3ebe5] text-[#6b4226] flex items-center justify-center hover:bg-[#e8d9ce] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-2 shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>

              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 mt-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear all items
              </button>

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
                      className="flex justify-between"
                    >

                      <span className="truncate mr-2">
                        {item.name} ×{item.quantity}
                      </span>

                      <span className="font-medium text-gray-700 whitespace-nowrap">
                        ₦
                        {(
                          item.price *
                          item.quantity
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
                    <span>Delivery Fee</span>

                    <span>
                      ₦{deliveryFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>

                    <span className="text-[#6b4226]">
                      ₦{grandTotal.toLocaleString()}
                    </span>
                  </div>

                </div>

                <div className="bg-[#f3ebe5] rounded-xl p-3 mt-4 text-xs text-[#6b4226]">
                  🚚 Estimated delivery:{" "}
                  <strong>25–35 minutes</strong>
                  <br />
                  📍 Delivering within Lagos Island & Mainland
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-linear-to-r from-[#4a2c1d] via-[#5a3825] to-[#7a4a2d] text-white py-3 rounded-xl font-bold mt-4 hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
                >
                  Proceed to Payment — ₦
                  {grandTotal.toLocaleString()}
                </button>

                <Link
                  to="/menu"
                  className="block text-center text-[#6b4226] text-sm mt-3 hover:underline font-medium"
                >
                  + Add more items
                </Link>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default CartPage;