"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  variant: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getSubtotal: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutMode: boolean;
  setCheckoutMode: (mode: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);

    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (cartItem) =>
          cartItem.id === item.id && cartItem.variant === item.variant
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity,
        };
        return updatedCart;
      } else {
        return [...prev, item];
      }
    });

    // Automatically open cart sidebar when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setIsCheckoutMode(false); // Reset checkout mode when closing cart
  };

  const setCheckoutModeHandler = (mode: boolean) => {
    setIsCheckoutMode(mode);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getSubtotal,
        isCartOpen,
        openCart,
        closeCart,
        isCheckoutMode,
        setCheckoutMode: setCheckoutModeHandler,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // If we're not in a browser and context is undefined, return a dummy context
  if (!isBrowser && context === undefined) {
    return {
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      getSubtotal: () => 0,
      isCartOpen: false,
      openCart: () => {},
      closeCart: () => {},
      isCheckoutMode: false,
      setCheckoutMode: () => {},
    };
  }

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
