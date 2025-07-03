"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  description?: string;
  rating?: number;
  category?: string;
}

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  isLoading: boolean;
  deletingItems: Set<number>;
  error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch favorites when session changes or component mounts
  useEffect(() => {
    if (isClient && status !== "loading") {
      fetchFavorites();
    }
  }, [isClient, session, status]);

  // API call to fetch favorites
  const fetchFavorites = async () => {
    if (!isClient) return;

    setIsLoading(true);
    setError(null);

    try {
      if (session?.user) {
        // Authenticated user - fetch from API
        const response = await fetch("/api/favorites");

        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        } else if (response.status === 401) {
          // Unauthorized - fallback to localStorage
          loadFromLocalStorage();
        } else {
          throw new Error("Failed to fetch favorites");
        }
      } else {
        // Guest user - use localStorage
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("Failed to load favorites");
      // Fallback to localStorage on error
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load favorites from localStorage (fallback)
  const loadFromLocalStorage = () => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error("Failed to parse favorites from localStorage:", error);
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  };

  // Save to localStorage (for guest users)
  const saveToLocalStorage = (newFavorites: Product[]) => {
    if (isClient) {
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }
  };

  const addToFavorites = async (product: Product) => {
    if (!isClient) return;

    // Check if product already exists in favorites
    if (favorites.some((item) => item.id === product.id)) {
      return;
    }

    setError(null);
    const newFavorites = [...favorites, product];

    // Optimistically update UI
    setFavorites(newFavorites);

    try {
      if (session?.user) {
        // Authenticated user - save to API
        const response = await fetch("/api/favorites/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          throw new Error("Failed to add to favorites");
        }
      } else {
        // Guest user - save to localStorage
        saveToLocalStorage(newFavorites);
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      setError("Failed to add to favorites");
      // Revert optimistic update
      setFavorites(favorites);

      // For authenticated users, try localStorage as fallback
      if (session?.user) {
        saveToLocalStorage(newFavorites);
      }
    }
  };

  const removeFromFavorites = async (productId: number) => {
    if (!isClient) return;

    // Prevent multiple simultaneous deletions of the same item
    if (deletingItems.has(productId)) {
      console.warn("Already deleting product:", productId);
      return;
    }

    setError(null);

    // Store current favorites before any updates (avoid stale closure)
    const currentFavorites = [...favorites];
    const newFavorites = currentFavorites.filter(
      (item) => item.id !== productId
    );

    // Check if item actually exists before attempting deletion
    if (currentFavorites.length === newFavorites.length) {
      console.warn("Product not found in favorites:", productId);
      return;
    }

    // Mark item as being deleted
    setDeletingItems((prev) => new Set(prev).add(productId));

    // Optimistically update UI
    setFavorites(newFavorites);

    try {
      if (session?.user) {
        console.log(
          "Sending delete request for productId:",
          productId,
          "Type:",
          typeof productId
        );

        // Authenticated user - remove from API
        const response = await fetch("/api/favorites/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        console.log(
          "Delete response status:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to remove from favorites");
        }

        // Verify response
        const result = await response.json();
        console.log("Remove favorites API response:", result);
        if (!result.success) {
          throw new Error(result.error || "API returned failure status");
        }
      } else {
        // Guest user - update localStorage
        saveToLocalStorage(newFavorites);
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setError("Failed to remove from favorites");

      // Revert optimistic update using the stored current favorites
      setFavorites(currentFavorites);

      // For authenticated users, try localStorage as fallback
      if (session?.user) {
        try {
          saveToLocalStorage(newFavorites);
          setError("Removed locally, but failed to sync with server");
        } catch (localError) {
          console.error("Local storage fallback failed:", localError);
        }
      }
    } finally {
      // Always cleanup the deleting state
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const isFavorite = (productId: number) => {
    return favorites.some((item) => item.id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        isLoading,
        deletingItems,
        error,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // If we're not in a browser and context is undefined, return a dummy context
  if (!isBrowser && context === undefined) {
    return {
      favorites: [],
      addToFavorites: async () => {},
      removeFromFavorites: async () => {},
      isFavorite: () => false,
      isLoading: false,
      deletingItems: new Set(),
      error: null,
    };
  }

  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}
