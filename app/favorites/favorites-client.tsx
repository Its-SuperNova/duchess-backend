"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";

export default function FavoritesClient() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();

  const handleRemoveFavorite = (id: number) => {
    removeFromFavorites(id);
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
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 h-[64px] flex items-center border-b">
        <Link href="/" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">My Favorites</h1>
        <div className="ml-auto text-sm text-gray-500 mr-4">
          {favorites.length} {favorites.length === 1 ? "item" : "items"}
        </div>
        {/* Profile Picture */}
        <div className="relative h-8 w-8 rounded-full overflow-hidden">
          <Image
            src="/profile-avatar.png"
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-4">
        {favorites.length > 0 ? (
          <div className="divide-y">
            {favorites.map((item) => (
              <div key={item.id} className="py-4 flex items-center">
                {/* Product image */}
                <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div
                      className={`w-4 h-4 border ${
                        item.isVeg ? "border-green-600" : "border-red-600"
                      } flex items-center justify-center rounded-sm mr-2`}
                    >
                      <div
                        className={`w-2 h-2 ${
                          item.isVeg ? "bg-green-600" : "bg-red-600"
                        } rounded-full`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {item.description?.substring(0, 30)}...
                    </p>
                  </div>
                  <p className="font-semibold text-primary mt-1">
                    ₹{item.price}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-md"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="w-9 h-9 flex items-center justify-center text-gray-500 border border-gray-300 rounded-md"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-gray-400"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              Your favorites list is empty
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Save your favorite items to find them easily later
            </p>
            <Link
              href="/"
              className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
            >
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
