"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-32 h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
    </div>
  ),
});
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import { useIsMobile } from "@/hooks/use-mobile";
import zeroPurchaseAnimation from "@/public/Lottie/Zero Purchase.json";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function FavoritesClient() {
  const { favorites, removeFromFavorites, isLoading, deletingItems, error } =
    useFavorites();
  const { addToCart } = useCart();
  const isMobile = useIsMobile();

  // Track previous favorites count for skeleton loader
  const [previousFavoritesCount, setPreviousFavoritesCount] = useState(0);

  // Confirmation dialog/drawer state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Update previous favorites count when favorites change (but not during loading)
  useEffect(() => {
    if (!isLoading && favorites.length > 0) {
      setPreviousFavoritesCount(favorites.length);
    }
  }, [favorites, isLoading]);

  const handleRemoveFavorite = (id: number, name: string) => {
    // Prevent action if already deleting
    if (deletingItems.has(id)) {
      return;
    }

    setProductToDelete({ id, name });
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete || deletingItems.has(productToDelete.id)) return;

    try {
      await removeFromFavorites(productToDelete.id);
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error removing favorite:", error);
      // Dialog/drawer will stay open to show error - user can retry or cancel
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setProductToDelete(null);
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
      <div className="px-4 py-4 bg-[#f5f5f7]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Link href="/">
              <div className="bg-white p-3 md:p-2 rounded-full md:rounded-[12px] shadow-sm hover:bg-gray-50 transition-colors">
                <IoIosArrowBack className="h-5 w-5 text-gray-700" />
              </div>
            </Link>
            <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
              Favorites
            </h1>
            <div className="w-9 md:hidden"></div>{" "}
            {/* Spacer to balance the layout on mobile only */}
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-4 py-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="w-full md:mx-auto">
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 min-[1150px]:grid-cols-3">
                {/* Skeleton cards - dynamic count based on previous favorites */}
                {Array.from({
                  length:
                    previousFavoritesCount > 0 ? previousFavoritesCount : 3,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="flex h-[124px] items-start gap-4 py-3 px-3 bg-white rounded-[20px] w-full animate-pulse"
                  >
                    {/* Skeleton image */}
                    <div className="h-[100px] w-24 rounded-2xl bg-gray-200 flex-shrink-0"></div>

                    <div className="flex-1 flex flex-col justify-between h-full">
                      {/* Skeleton product details */}
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Skeleton price */}
                        <div className="flex items-center gap-2">
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>

                        {/* Skeleton action buttons */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="w-full  md:mx-auto">
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 min-[1150px]:grid-cols-3">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="flex h-[124px] items-start gap-4 py-3 px-3 bg-white rounded-[20px] w-full"
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
                            onClick={() =>
                              handleRemoveFavorite(item.id, item.name)
                            }
                            disabled={deletingItems.has(item.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${
                              deletingItems.has(item.id)
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                : "border-red-500 bg-white hover:bg-red-50"
                            }`}
                            aria-label="Remove from favorites"
                          >
                            {deletingItems.has(item.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 px-6">
              <div className="mb-4 flex justify-center">
                <div className="w-[400px] h-[300px] md:h-[400px] md:w-[500px]">
                  <Lottie
                    animationData={zeroPurchaseAnimation}
                    loop={true}
                    autoplay={true}
                  />
                </div>
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

      {/* Delete Confirmation - Desktop: Dialog, Mobile: Drawer */}
      {!isMobile ? (
        <AlertDialog
          open={showDeleteConfirmation}
          onOpenChange={setShowDeleteConfirmation}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Favorites</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{productToDelete?.name}" from
                your favorites? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={cancelDelete}
                disabled={
                  productToDelete
                    ? deletingItems.has(productToDelete.id)
                    : false
                }
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={
                  productToDelete
                    ? deletingItems.has(productToDelete.id)
                    : false
                }
                className={`${
                  productToDelete && deletingItems.has(productToDelete.id)
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                }`}
              >
                {productToDelete && deletingItems.has(productToDelete.id) ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </div>
                ) : (
                  "Remove"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Drawer
          open={showDeleteConfirmation}
          onOpenChange={setShowDeleteConfirmation}
        >
          <DrawerContent>
            <DrawerHeader className="text-center">
              <DrawerTitle>Remove from Favorites</DrawerTitle>
              <DrawerDescription>
                Are you sure you want to remove "{productToDelete?.name}" from
                your favorites? This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="pt-2">
              <Button
                onClick={confirmDelete}
                disabled={
                  productToDelete
                    ? deletingItems.has(productToDelete.id)
                    : false
                }
                className={`w-full ${
                  productToDelete && deletingItems.has(productToDelete.id)
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {productToDelete && deletingItems.has(productToDelete.id) ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </div>
                ) : (
                  "Remove from Favorites"
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={
                    productToDelete
                      ? deletingItems.has(productToDelete.id)
                      : false
                  }
                  className="w-full"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
