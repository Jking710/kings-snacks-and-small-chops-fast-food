import React, {
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

import { CartContext } from "./CartContextData.js";
import { useAuth } from "./AuthContext.jsx";

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [cartItems, setCartItems] = useState([]);

  const previousUserKeyRef = useRef(null);

  const getUserKey = () => {
    if (!user) return null;

    return (
      user._id ||
      user.id ||
      user.email ||
      null
    );
  };

  const userKey = getUserKey();

  const getStorageKey = (key) => {
    if (!key) return null;

    return `kings-chops-cart-${key}`;
  };

  // Load the user's saved cart whenever the logged-in user changes.
  useEffect(() => {
    if (!isAuthenticated || !userKey) {
      setCartItems([]);
      previousUserKeyRef.current = null;
      return;
    }

    // Prevent unnecessary reloads for the same user.
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

  // Save the cart whenever it changes for the logged-in user.
  useEffect(() => {
    if (!isAuthenticated || !userKey) {
      return;
    }

    const storageKey = getStorageKey(userKey);

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems, isAuthenticated, userKey]);

  const addToCart = (item) => {
    if (!isAuthenticated || !userKey) {
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((i) => i.id !== id)
    );
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: qty,
            }
          : i
      )
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

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
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
    children
  );
}

export function useCart() {
  return useContext(CartContext);
}