"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function FavoritesClient() {
  const { favorites, removeFromFavorites, isLoading, error } = useFavorites();
  const { addToCart } = useCart();
  const isMobile = useIsMobile();

  // Animation data - using the same empty cart animation
  const [animationData, setAnimationData] = useState(null);

  // Load animation data
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(
          "https://d1jj76g3lut4fe.cloudfront.net/saved_colors/98652/0M71xqBxut5tSYdp.json"
        );
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Failed to load animation:", error);
      }
    };

    loadAnimation();
  }, []);

  const handleRemoveFavorite = async (id: number) => {
    try {
      await removeFromFavorites(id);
    } catch (error) {
      console.error("Error removing favorite:", error);
      // Could add toast notification here
    }
  };

  const handleAddToCart = (id: number) => {
    const product = favorites.find((item) => item.id === id);
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: "Pastry", // Default category
        variant: "Regular", // Default variant
      });
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-32">
      {/* Page Header */}
      <div className="px-4 py-4  bg-[#f5f5f7]">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="bg-white p-3 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <IoIosArrowBack className="h-5 w-5 text-gray-700" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
            Favorites
          </h1>
          <div className="w-9"></div> {/* Spacer to balance the layout */}
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-4 py-4">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading favorites...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="flex h-[124px] items-start gap-4 py-3 px-3 bg-white rounded-[20px]"
              >
                {/* Product image */}
                <div className="relative h-[100px] w-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.image || "/images/red-velvet.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/red-velvet.png";
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full">
                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">
                        {item.category || "Pastry"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-500 line-through">
                        ₹{(item.price * 1.2).toFixed(0)}
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{item.price.toFixed(0)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-red-500 bg-white transition-colors hover:bg-red-50"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="mb-4 flex justify-center">
              {animationData && (
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={{
                    width: isMobile ? "320px" : "320px",
                    height: "auto",
                  }}
                />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Your favorites list is empty
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Save your favorite items to find them easily later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
