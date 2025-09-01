"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  updateCartItemCustomization: (
    uniqueId: string,
    customizationOptions: Partial<
      Pick<
        CartItem,
        "addTextOnCake" | "addCandles" | "addKnife" | "addMessageCard"
      >
    >
  ) => void;
  getSubtotal: () => number;
  isLoading: boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
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

  const loadCartFromLocalStorage = useCallback(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  const loadCartFromDatabase = useCallback(async () => {
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
  }, [loadCartFromLocalStorage]);

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

  const addToCart = useCallback(
    async (item: CartItem) => {
      // Generate unique ID for the item
      const uniqueId = item.uniqueId || `${Date.now()}-${Math.random()}`;
      const itemWithUniqueId = { ...item, uniqueId };

      // Optimistic update - add item immediately for instant feedback
      const previousCart = [...cart];
      setCart((prev) => {
        // If uniqueId is present, always add as a new item
        if (itemWithUniqueId.uniqueId) {
          return [...prev, itemWithUniqueId];
        }
        // Fallback to old logic for legacy items
        const existingItemIndex = prev.findIndex(
          (cartItem) =>
            cartItem.id === itemWithUniqueId.id &&
            cartItem.variant === itemWithUniqueId.variant
        );

        if (existingItemIndex !== -1) {
          const updatedCart = [...prev];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity:
              updatedCart[existingItemIndex].quantity +
              itemWithUniqueId.quantity,
          };
          return updatedCart;
        } else {
          return [...prev, itemWithUniqueId];
        }
      });

      if (session?.user?.email) {
        // User is authenticated, sync with database in background
        try {
          setIsLoading(true);
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemWithUniqueId),
          });

          if (!response.ok) {
            console.error("Failed to add item to database cart");
            // Revert optimistic update on failure
            setCart(previousCart);
          }
          // Success: keep the optimistic update (item stays in cart)
        } catch (error) {
          console.error("Error adding to database cart:", error);
          // Revert optimistic update on error
          setCart(previousCart);
        } finally {
          setIsLoading(false);
        }
      }
      // For non-authenticated users, the optimistic update is already applied
    },
    [session?.user?.email, cart]
  );

  const removeFromCart = useCallback(
    async (uniqueId: string) => {
      // Optimistic update - remove item immediately for instant feedback
      const previousCart = [...cart];
      setCart((prev) => prev.filter((item) => item.uniqueId !== uniqueId));

      if (session?.user?.email) {
        // User is authenticated, sync with database in background
        try {
          const response = await fetch("/api/cart/remove", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uniqueItemId: uniqueId }),
          });

          if (!response.ok) {
            console.error("Failed to remove item from database cart");
            // Revert optimistic update on failure
            setCart(previousCart);
          }
          // Success: keep the optimistic update (item stays removed)
        } catch (error) {
          console.error("Error removing from database cart:", error);
          // Revert optimistic update on error
          setCart(previousCart);
        }
      }
      // For non-authenticated users, the optimistic update is already applied
    },
    [session?.user?.email, cart]
  );

  const updateQuantity = useCallback(
    async (uniqueId: string, quantity: number) => {
      // Optimistic update - update UI immediately for instant feedback
      const previousCart = [...cart];
      setCart((prev) =>
        prev.map((item) =>
          item.uniqueId === uniqueId ? { ...item, quantity } : item
        )
      );

      if (session?.user?.email) {
        // User is authenticated, sync with database in background
        try {
          const response = await fetch("/api/cart/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uniqueItemId: uniqueId, quantity }),
          });

          if (!response.ok) {
            console.error("Failed to update quantity in database cart");
            // Revert optimistic update on failure
            setCart(previousCart);
          }
          // Success: keep the optimistic update (no need to reload from database)
        } catch (error) {
          console.error("Error updating quantity in database cart:", error);
          // Revert optimistic update on error
          setCart(previousCart);
        }
      }
      // For non-authenticated users, the optimistic update is already applied
    },
    [session?.user?.email, cart]
  );

  const getSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
    }

    // Clear database cart for authenticated users
    if (session?.user?.email) {
      try {
        const response = await fetch("/api/cart/clear", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          console.error("Failed to clear database cart");
        } else {
          console.log("Database cart cleared successfully");
        }
      } catch (error) {
        console.error("Error clearing database cart:", error);
      }
    }
  }, [session?.user?.email]);

  const updateCartItemCustomization = useCallback(
    async (
      uniqueId: string,
      customizationOptions: Partial<
        Pick<
          CartItem,
          "addTextOnCake" | "addCandles" | "addKnife" | "addMessageCard"
        >
      >
    ) => {
      // Optimistic update - update UI immediately for instant feedback
      const previousCart = [...cart];
      setCart((prev) =>
        prev.map((item) =>
          item.uniqueId === uniqueId
            ? { ...item, ...customizationOptions }
            : item
        )
      );

      if (session?.user?.email) {
        // User is authenticated, sync with database in background
        try {
          const response = await fetch("/api/cart/update-customization", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uniqueItemId: uniqueId,
              customizationOptions,
            }),
          });

          if (!response.ok) {
            console.error("Failed to update customization in database cart");
            // Revert optimistic update on failure
            setCart(previousCart);
          }
          // Success: keep the optimistic update
        } catch (error) {
          console.error(
            "Error updating customization in database cart:",
            error
          );
          // Revert optimistic update on error
          setCart(previousCart);
        }
      }
      // For non-authenticated users, the optimistic update is already applied
    },
    [session?.user?.email, cart]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItemCustomization,
      getSubtotal,
      isLoading,
      clearCart,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItemCustomization,
      getSubtotal,
      isLoading,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
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
      updateCartItemCustomization: () => {},
      getSubtotal: () => 0,
      isLoading: false,
      clearCart: () => {},
    };
  }

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
