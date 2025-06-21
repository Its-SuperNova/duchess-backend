"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { GrSquare } from "react-icons/gr";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string | number; // Support both string and number IDs
  name: string;
  rating: number;
  imageUrl: string;
  price: number;
  originalPrice?: number; // For displaying discounts
  isVeg: boolean;
  description?: string;
  category?: string;
  hasOffer?: boolean;
  offerPercentage?: number;
}

export default function ProductCard({
  id,
  name,
  rating,
  imageUrl,
  price,
  originalPrice,
  isVeg,
  description,
  category,
  hasOffer,
  offerPercentage,
}: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [isLiked, setIsLiked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Convert ID to number for favorites and cart (legacy compatibility)
  const numericId =
    typeof id === "string" ? parseInt(id.replace(/\D/g, "")) || 0 : id;

  // Set isClient to true when component mounts (client-side only)
  useState(() => {
    setIsClient(true);
    setIsLiked(isFavorite(numericId));
  });

  const handleFavoriteToggle = () => {
    if (!isClient) return;

    if (isLiked) {
      removeFromFavorites(numericId);
      setIsLiked(false);
    } else {
      addToFavorites({
        id: numericId,
        name,
        price,
        image: imageUrl,
        isVeg,
        description,
        rating,
      });
      setIsLiked(true);
    }
  };

  const handleAddToCart = () => {
    if (!isClient) return;

    addToCart({
      id: numericId,
      name,
      price,
      image: imageUrl,
      quantity: 1,
      category: category || "Pastry",
      variant: "Regular",
    });

    toast({
      title: "Added to cart!",
      description: `${name} has been added to your cart.`,
      duration: 3000,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Product Image with Favorite Button and Offer Badge */}
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

        {/* Offer Badge */}
        {hasOffer && offerPercentage && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {offerPercentage}% OFF
          </div>
        )}

        {/* Favorite Button */}
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
            <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {name}
            </h3>
          </Link>
          <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
            <FaStar className="text-amber-500 mr-1" size={12} />
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              {rating}
            </span>
          </div>
        </div>

        <div className="flex items-center mb-2">
          <GrSquare
            className={isVeg ? "text-green-600" : "text-red-600"}
            style={{ width: 16, height: 16, minWidth: 16, minHeight: 16 }}
            aria-label={isVeg ? "Vegetarian" : "Non-Vegetarian"}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 ml-2">
            {description || "Delicious pastry made with premium ingredients"}
          </p>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-white">
              ₹{price}
            </p>
            {originalPrice && originalPrice > price && (
              <p className="text-sm text-gray-500 line-through">
                ₹{originalPrice}
              </p>
            )}
          </div>
          {/* Removed Add to Cart button */}
        </div>
      </div>
    </div>
  );
}
