"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Product {
  id: number
  name: string
  price: number
  image: string
  isVeg: boolean
  description?: string
  rating?: number
}

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: number) => void
  isFavorite: (productId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (error) {
        console.error("Failed to parse favorites from localStorage:", error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites, isClient])

  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      // Check if product already exists in favorites
      if (prev.some((item) => item.id === product.id)) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeFromFavorites = (productId: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId))
  }

  const isFavorite = (productId: number) => {
    return favorites.some((item) => item.id === productId)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  // If we're not in a browser and context is undefined, return a dummy context
  if (!isBrowser && context === undefined) {
    return {
      favorites: [],
      addToFavorites: () => {},
      removeFromFavorites: () => {},
      isFavorite: () => false,
    }
  }

  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }

  return context
}
