"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa"
import { useFavorites } from "@/context/favorites-context"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  id: number
  name: string
  rating: number
  imageUrl: string
  price: number
  isVeg: boolean
  description?: string
}

export default function ProductCard({ id, name, rating, imageUrl, price, isVeg, description }: ProductCardProps) {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const [isLiked, setIsLiked] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts (client-side only)
  useState(() => {
    setIsClient(true)
    setIsLiked(isFavorite(id))
  })

  const handleFavoriteToggle = () => {
    if (!isClient) return

    if (isLiked) {
      removeFromFavorites(id)
      setIsLiked(false)
    } else {
      addToFavorites({
        id,
        name,
        price,
        image: imageUrl,
        isVeg,
        description,
        rating,
      })
      setIsLiked(true)
    }
  }

  const handleAddToCart = () => {
    if (!isClient) return

    addToCart({
      id,
      name,
      price,
      image: imageUrl,
      quantity: 1,
      category: "Pastry", // Default category
      variant: "Regular", // Default variant
    })

    toast({
      title: "Added to cart!",
      description: `${name} has been added to your cart.`,
      duration: 3000,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Product Image with Favorite Button */}
      <div className="relative">
        <Link href={`/products/${id}`}>
          <div className="relative h-48 w-full">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          {isClient && isLiked ? (
            <FaHeart className="text-red-500" size={16} />
          ) : (
            <FaRegHeart className="text-gray-600" size={16} />
          )}
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <Link href={`/products/${id}`} className="hover:underline">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{name}</h3>
          </Link>
          <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
            <FaStar className="text-amber-500 mr-1" size={12} />
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">{rating}</span>
          </div>
        </div>

        <div className="flex items-center mb-2">
          <div
            className={`w-3 h-3 border ${
              isVeg ? "border-green-600" : "border-red-600"
            } flex items-center justify-center rounded-sm mr-1.5`}
          >
            <div className={`w-1.5 h-1.5 ${isVeg ? "bg-green-600" : "bg-red-600"} rounded-full`}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {description || "Delicious pastry made with premium ingredients"}
          </p>
        </div>

        <div className="flex justify-between items-center mt-3">
          <p className="font-semibold text-gray-900 dark:text-white">₹{price}</p>
          <button
            onClick={handleAddToCart}
            className="bg-[#361C1C] hover:bg-[#4a2a2a] text-white text-xs font-medium py-1.5 px-3 rounded-full"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
