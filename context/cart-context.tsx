"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  variant: string;
  orderType?: "weight" | "piece";
  addTextOnCake?: boolean;
  addCandles?: boolean;
  addKnife?: boolean;
  addMessageCard?: boolean;
  cakeText?: string;
  giftCardText?: string;
  uniqueId?: string; // Unique identifier for each cart item
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity: number }) => void;
  removeFromCart: (id: number, variant?: string) => void;
  updateQuantity: (id: number, quantity: number, variant?: string) => void;
  getSubtotal: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutMode: boolean;
  setCheckoutMode: (mode: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart based on authentication status
  useEffect(() => {
    if (!isClient) return;

    const loadCart = async () => {
      if (session?.user?.email) {
        // User is authenticated, load from database
        await loadCartFromDatabase();
      } else if (status === "unauthenticated") {
        // User is not authenticated, load from localStorage
        loadCartFromLocalStorage();
      }
      // If status is "loading", wait for auth to complete
    };

    loadCart();
  }, [isClient, session, status]);

  // Sync localStorage cart with database when user logs in
  useEffect(() => {
    if (session?.user?.email && isClient) {
      syncCartOnLogin();
    }
  }, [session?.user?.email, isClient]);

  // Save cart to localStorage whenever it changes (for non-authenticated users)
  useEffect(() => {
    if (isClient && !session?.user?.email) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isClient, session?.user?.email]);

  const loadCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  };

  const loadCartFromDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart || []);
      } else {
        console.error("Failed to load cart from database");
        // Fallback to localStorage
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading cart from database:", error);
      // Fallback to localStorage
      loadCartFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const syncCartOnLogin = async () => {
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      try {
        const localCartItems = JSON.parse(localCart);
        if (localCartItems.length > 0) {
          const response = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ localCartItems }),
          });

          if (response.ok) {
            const data = await response.json();
            setCart(data.cart || []);
            // Clear localStorage after successful sync
            localStorage.removeItem("cart");
          }
        } else {
          // Load existing database cart
          await loadCartFromDatabase();
        }
      } catch (error) {
        console.error("Error syncing cart:", error);
        await loadCartFromDatabase();
      }
    } else {
      // Load existing database cart
      await loadCartFromDatabase();
    }
  };

  const addToCart = async (item: CartItem) => {
    if (session?.user?.email) {
      // User is authenticated, add to database
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          // Reload cart from database to get updated state
          await loadCartFromDatabase();
        } else {
          console.error("Failed to add item to database cart");
          // Fallback to localStorage behavior
          addToCartLocal(item);
        }
      } catch (error) {
        console.error("Error adding to database cart:", error);
        // Fallback to localStorage behavior
        addToCartLocal(item);
      } finally {
        setIsLoading(false);
      }
    } else {
      // User is not authenticated, use localStorage
      addToCartLocal(item);
    }

    // Automatically open cart sidebar when item is added
    setIsCartOpen(true);
  };

  const addToCartLocal = (item: CartItem) => {
    setCart((prev) => {
      // If uniqueId is present, always add as a new item
      if (item.uniqueId) {
        return [...prev, item];
      }
      // Fallback to old logic for legacy items
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
  };

  const removeFromCart = async (id: number, variant?: string) => {
    if (session?.user?.email) {
      // User is authenticated, remove from database
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, variant }),
        });

        if (response.ok) {
          // Reload cart from database to get updated state
          await loadCartFromDatabase();
        } else {
          console.error("Failed to remove item from database cart");
          // Fallback to localStorage behavior
          setCart((prev) =>
            prev.filter(
              (item) =>
                !(item.id === id && (!variant || item.variant === variant))
            )
          );
        }
      } catch (error) {
        console.error("Error removing from database cart:", error);
        // Fallback to localStorage behavior
        setCart((prev) =>
          prev.filter(
            (item) =>
              !(item.id === id && (!variant || item.variant === variant))
          )
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // User is not authenticated, use localStorage
      setCart((prev) =>
        prev.filter(
          (item) => !(item.id === id && (!variant || item.variant === variant))
        )
      );
    }
  };

  const updateQuantity = async (
    id: number,
    quantity: number,
    variant?: string
  ) => {
    if (session?.user?.email) {
      // User is authenticated, update in database
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, quantity, variant }),
        });

        if (response.ok) {
          // Reload cart from database to get updated state
          await loadCartFromDatabase();
        } else {
          console.error("Failed to update quantity in database cart");
          // Fallback to localStorage behavior
          setCart((prev) =>
            prev.map((item) =>
              item.id === id && (!variant || item.variant === variant)
                ? { ...item, quantity }
                : item
            )
          );
        }
      } catch (error) {
        console.error("Error updating quantity in database cart:", error);
        // Fallback to localStorage behavior
        setCart((prev) =>
          prev.map((item) =>
            item.id === id && (!variant || item.variant === variant)
              ? { ...item, quantity }
              : item
          )
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // User is not authenticated, use localStorage
      setCart((prev) =>
        prev.map((item) =>
          item.id === id && (!variant || item.variant === variant)
            ? { ...item, quantity }
            : item
        )
      );
    }
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
        isLoading,
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
      isLoading: false,
    };
  }

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
