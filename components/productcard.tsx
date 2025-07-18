"use client";

import { useState, memo, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { GrSquare } from "react-icons/gr";
import { GoHeartFill } from "react-icons/go";
import { Star } from "@solar-icons/react";
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

const ProductCard = memo(function ProductCard({
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

  // Memoize the favorite product object to prevent recreation on every render
  const favoriteProduct = useMemo(
    () => ({
      id: numericId,
      name,
      price,
      image: imageUrl,
      isVeg,
      description,
      rating,
      category,
    }),
    [numericId, name, price, imageUrl, isVeg, description, rating, category]
  );

  // Memoize the cart item object to prevent recreation on every render
  const cartItem = useMemo(
    () => ({
      id: numericId,
      name,
      price,
      image: imageUrl,
      quantity: 1,
      category: category || "Pastry",
      variant: "Regular",
    }),
    [numericId, name, price, imageUrl, category]
  );

  const handleFavoriteToggle = useCallback(async () => {
    if (!isClient) return;

    try {
      if (isLiked) {
        await removeFromFavorites(numericId);
        setIsLiked(false);
      } else {
        await addToFavorites(favoriteProduct);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert UI state on error
      setIsLiked(!isLiked);

      // Show toast notification
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    isClient,
    isLiked,
    numericId,
    removeFromFavorites,
    addToFavorites,
    favoriteProduct,
    toast,
  ]);

  const handleAddToCart = useCallback(() => {
    if (!isClient) return;
    addToCart(cartItem);
  }, [isClient, addToCart, cartItem]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] ">
      {/* Product Image with Favorite Button and Offer Badge */}
      <div className="relative">
        <Link href={`/products/${id}`}>
          <div className="relative h-48 w-full rounded-[28px] overflow-hidden">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 ${
            isClient && isLiked ? "bg-red-500" : "bg-white"
          }`}
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <GoHeartFill
            className={`h-5 w-5 ${
              isClient && isLiked ? "text-white" : "text-[#ced2da]"
            }`}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Left side: Category and Product Name */}
        <div className="flex justify-between items-end">
          <div className="flex-1">
            {/* Category - displayed above product name in small gray text */}
            {category && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {category}
              </p>
            )}

            {/* Product Name - large bold text */}
            <Link href={`/products/${id}`} className="hover:underline">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 mb-2">
                {name}
              </h3>
            </Link>
          </div>

          {/* Veg/Non-veg indicator on the right side, above price */}
          <div className="flex justify-end mb-[14px]">
            <div className="flex items-center">
              <div
                className={`w-6 h-6 md:w-5 md:h-5 border-[2px] rounded-lg md:rounded-md flex items-center justify-center ${
                  isVeg ? "border-green-500" : "border-red-500"
                }`}
              >
                <div
                  className={`w-3 h-3 md:w-2 md:h-2 rounded-full ${
                    isVeg ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating and Price Row */}
        <div className="flex justify-between items-center">
          {/* Rating on the left with gradient background */}
          <div className="flex items-center bg-gradient-to-r from-amber-100 to-white px-2 py-1 rounded-full">
            <Star weight="Bold" className="text-amber-500 mr-1" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {rating}
            </span>
          </div>

          {/* Price on the right */}
          <div className="flex items-center">
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              ₹{price}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
