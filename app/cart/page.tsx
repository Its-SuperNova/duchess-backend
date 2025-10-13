"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrashBinTrash } from "@solar-icons/react";
import dynamic from "next/dynamic";
import CartSkeleton from "@/components/cart-skeleton";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-32 h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
    </div>
  ),
});
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
// Removed direct import of large Lottie JSON to reduce bundle size
// Dynamically import Icon to reduce initial bundle size
const Icon = dynamic(
  () => import("@iconify/react").then((m) => ({ default: m.Icon })),
  {
    ssr: false,
    loading: () => (
      <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
    ),
  }
) as any;

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    isLoading: cartLoading,
  } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [zeroPurchaseAnimation, setZeroPurchaseAnimation] = useState(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // Load Lottie animation data dynamically to reduce bundle size
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch("/Lottie/Zero Purchase.json");
        const animationData = await response.json();
        setZeroPurchaseAnimation(animationData);
      } catch (error) {
        console.error("Failed to load zero purchase animation:", error);
      }
    };

    if (cart.length === 0) {
      loadAnimation();
    }
  }, [cart.length]);

  // Get cart item count from localStorage for skeleton (fallback to 3 if not available)
  const getSkeletonItemCount = () => {
    if (typeof window !== "undefined") {
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          return Math.max(1, Math.min(parsedCart.length, 5)); // Between 1 and 5 items
        }
      } catch (error) {
        console.error("Error parsing stored cart for skeleton:", error);
      }
    }
    return 3; // Default fallback
  };

  // Show skeleton loader while cart is loading
  if (cartLoading) {
    return <CartSkeleton itemCount={getSkeletonItemCount()} />;
  }

  // Render cart items component
  const renderCartItems = () => {
    if (cart.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center px-4 gap-6">
          <div className="w-[400px] h-[300px] md:h-[400px] md:w-[500px] mb-4 lg:mb-6">
            {zeroPurchaseAnimation ? (
              <Lottie
                animationData={zeroPurchaseAnimation}
                loop={true}
                autoplay={true}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              Looks like you haven't added any delicious treats to your cart
              yet.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm lg:text-base">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 lg:space-y-4">
        {cart.map((item) => {
          const uid = (item.uniqueId || `${item.id}-${item.variant}`) as string;
          const qty = item.quantity || 1;

          return (
            <div
              key={uid}
              className="bg-white dark:bg-gray-800 rounded-[16px] lg:rounded-[22px] p-3 lg:p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex w-full min-w-0">
                  {/* Product Image */}
                  <div className="relative h-[72px] w-[72px] lg:h-[88px] lg:w-[88px] rounded-[16px] lg:rounded-[20px] overflow-hidden mr-3 lg:mr-3 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
                      {/* Name and category */}
                      <div className="flex-1 w-full min-w-0">
                        {/* Single-line name with ellipsis */}
                        <h3
                          className="block truncate text-[14px] lg:text-[15px] leading-tight font-medium text-black dark:text-gray-200"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="text-[13px] lg:text-[14px] text-gray-500 dark:text-gray-400 truncate max-w-full">
                          {item.category ?? item.variant}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        aria-label="Remove item"
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0 self-start"
                        onClick={() => removeFromCart(uid)}
                      >
                        <TrashBinTrash className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                      </button>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between w-full mt-2 lg:mt-0">
                      {/* Price */}
                      <p className="text-[15px] lg:text-[16px] font-semibold text-black dark:text-gray-100">
                        ₹{item.price.toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 lg:gap-2 bg-[#F5F4F7] rounded-full p-1 shrink-0">
                        <button
                          aria-label="Decrease quantity"
                          className="w-[24px] h-[24px] lg:w-[26px] lg:h-[26px] flex items-center justify-center rounded-full border border-gray-200 bg-white transition-colors"
                          onClick={() =>
                            updateQuantity(uid, Math.max(1, qty - 1))
                          }
                        >
                          <Minus className="h-3 w-3 text-gray-600" />
                        </button>
                        <span className="font-medium text-gray-900 dark:text-white min-w-[20px] lg:min-w-[24px] text-center text-[11px] lg:text-[12px]">
                          {String(qty).padStart(2, "0")}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="w-[24px] h-[24px] lg:w-[26px] lg:h-[26px] flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                          onClick={() => updateQuantity(uid, qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleUpdateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(uniqueId, quantity);
  };

  const handleClose = () => {
    router.back();
  };

  const handleCreateCheckout = async () => {
    if (cart.length === 0) return;

    setIsCreatingCheckout(true);

    try {
      // Get user ID from database if user is authenticated
      let userId = null;
      if (session?.user?.email) {
        try {
          const userResponse = await fetch(
            `/api/user?email=${encodeURIComponent(session.user.email)}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.user?.id || null;
          }
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }

      // Prepare checkout data
      const checkoutData = {
        items: cart.map((item) => ({
          product_id: item.id.toString(),
          product_name: item.name,
          product_image: item.image,
          product_description: "", // CartItem doesn't have description
          category: item.category || "",
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          variant: item.variant || "",
          customization_options: {}, // CartItem doesn't have customizationOptions
          cake_text: item.cakeText || null,
          cake_flavor: null, // CartItem doesn't have cakeFlavor
          cake_size: null, // CartItem doesn't have cakeSize
          cake_weight: null, // CartItem doesn't have cakeWeight
          item_has_knife: item.addKnife || false,
          item_has_candle: item.addCandles || false,
          item_has_message_card: item.addMessageCard || false,
          item_message_card_text: item.giftCardText || null,
        })),
        totalAmount: cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        userId: userId,
        userEmail: session?.user?.email || null,
      };

      // Create checkout session
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { checkoutId } = await response.json();

      // Redirect to checkout page
      router.push(`/checkouts/${checkoutId}`);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // Checkout section component
  const CheckoutSection = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (cart.length === 0) return null;

    const total = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return (
      <div
        className={`${
          isMobile
            ? "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
            : "p-4 lg:p-6"
        }`}
      >
        <div
          className={`${
            isMobile
              ? "p-4 flex flex-col gap-4"
              : "max-w-[360px] ml-auto flex flex-col gap-3 items-end"
          }`}
        >
          {/* Estimated Total */}
          <div
            className={`flex items-center gap-2 ${
              isMobile ? "justify-between w-full" : ""
            }`}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Estimated total
            </span>
            <span className="text-lg font-semibold text-black dark:text-white">
              ₹{total.toFixed(2)}
            </span>
          </div>

          {/* Tax Info - Show on both mobile and desktop */}
          <p
            className={`text-xs text-gray-500 dark:text-gray-400 ${
              isMobile ? "text-center w-full" : "w-[300px] text-right"
            }`}
          >
            Taxes, Discounts and delivery charges will be calculated at checkout
            page
          </p>

          {/* Checkout Button */}
          <Button
            onClick={handleCreateCheckout}
            disabled={isCreatingCheckout}
            className="w-full h-[48px] bg-[#523435] hover:bg-[#402627] text-white py-4 rounded-[18px] font-medium"
          >
            {isCreatingCheckout ? "Creating Checkout..." : "Check out"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] dark:bg-[#202028]">
      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto py-6">
        {/* Cart Items */}
        <div className="p-4 lg:p-6 mb-6">
          {cart.length > 0 && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cart Items
            </h2>
          )}
          {renderCartItems()}
        </div>

        {/* Desktop Checkout Section - Hidden on mobile */}
        <div className="hidden lg:block">
          <CheckoutSection />
        </div>
      </div>

      {/* Mobile Checkout Section - Fixed at bottom */}
      <div className="lg:hidden">
        <CheckoutSection isMobile={true} />
        {/* Add bottom padding to prevent content from being hidden behind fixed checkout */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}
