import React, { useState, useContext, useEffect, useRef } from "react";

import { CartContext } from "./CartContextData.js";
import { useAuth } from "./AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [cartItems, setCartItems] = useState([]);

  const previousUserKeyRef = useRef(null);

  const getUserKey = () => {
    if (!user) return null;

    return user._id || user.id || user.email || null;
  };

  const userKey = getUserKey();

  const getStorageKey = (key) => {
    if (!key) return null;

    return `kings-chops-cart-${key}`;
  };

  useEffect(() => {
    if (!isAuthenticated || !userKey) {
      setCartItems([]);
      previousUserKeyRef.current = null;
      return;
    }

    if (previousUserKeyRef.current === userKey) {
      return;
    }

    previousUserKeyRef.current = userKey;

    const storageKey = getStorageKey(userKey);

    try {
      const savedCart = localStorage.getItem(storageKey);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to load saved cart:", error);

      setCartItems([]);
    }
  }, [isAuthenticated, userKey]);

  useEffect(() => {
    if (!isAuthenticated || !userKey) {
      return;
    }

    const storageKey = getStorageKey(userKey);

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems, isAuthenticated, userKey]);

  const createCartNotification = async (item) => {
    try {
      const token = localStorage.getItem("kc_token");

      if (!token) {
        console.error("Cart notification: authentication token missing");
        return;
      }

      const response = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "cart",
          title: "Item added to cart 🛒",
          message: `${item.name} has been added to your cart.`,
          link: "/cart",
          metadata: {
            productId: item.id || item.productId || null,
            productName: item.name,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Cart notification failed:",
          data.message || "Unknown error",
        );
        return;
      }

      console.log("✅ Cart notification created:", data);
    } catch (error) {
      console.error("Cart notification error:", error);
    }
  };

  const addToCart = (item) => {
    if (!isAuthenticated || !userKey) {
      return;
    }

    setCartItems((previous) => {
      const existing = previous.find((i) => i.id === item.id);

      if (existing) {
        return previous.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
              }
            : i,
        );
      }

      return [
        ...previous,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    createCartNotification(item);
  };

  const removeFromCart = (id) => {
    setCartItems((previous) => previous.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems((previous) =>
      previous.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: qty,
            }
          : i,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);

    if (!userKey) {
      return;
    }

    const storageKey = getStorageKey(userKey);

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear saved cart:", error);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return React.createElement(
    CartContext.Provider,
    {
      value: {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      },
    },
    children,
  );
}

export function useCart() {
  return useContext(CartContext);
}
