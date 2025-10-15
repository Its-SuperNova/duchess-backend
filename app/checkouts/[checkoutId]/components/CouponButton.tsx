"use client";

import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { TicketSale } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Lottie from "lottie-react";

interface CouponButtonProps {
  checkoutId: string;
  selectedCoupon?: string | null;
  onCouponApplied?: (coupon: Coupon | null) => void;
  onCheckoutDataUpdate?: (data: any) => void;
  checkoutData?: any;
}

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  apply_to_specific: boolean;
  restriction_type?: "products" | "categories";
  applicable_categories?: string[];
  applicable_products?: number[];
}

interface CartItem {
  product_id: number;
  category_id: string;
  product_name: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CouponButton({
  checkoutId,
  selectedCoupon,
  onCouponApplied,
  onCheckoutDataUpdate,
  checkoutData,
}: CouponButtonProps) {
  const [featuredCoupon, setFeaturedCoupon] = useState<Coupon | null>(null);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  // Check if items already have discounts applied
  const hasExistingDiscounts = checkoutData?.items?.some(
    (item: any) =>
      item.original_price !== undefined &&
      item.discount_amount !== undefined &&
      item.discount_amount > 0
  );

  // Load Lottie animation data
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch("/Lottie/Success2.json");
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Failed to load animation:", error);
      }
    };
    loadAnimation();
  }, []);

  // Auto-close dialog after animation completes
  useEffect(() => {
    if (animationComplete && showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        setAnimationComplete(false);
      }, 3000); // Close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [animationComplete, showSuccessPopup]);

  // Restore applied coupon state from checkout data on component load
  useEffect(() => {
    if (checkoutData && checkoutData.items && checkoutData.items.length > 0) {
      // Check if any item has a coupon applied
      const itemWithCoupon = checkoutData.items.find(
        (item: any) => item.coupon_applied
      );

      if (itemWithCoupon && itemWithCoupon.coupon_applied) {
        // Find the coupon in the available coupons list
        const coupon = allCoupons.find(
          (c) => c.code === itemWithCoupon.coupon_applied
        );
        if (coupon) {
          setAppliedCoupon(coupon);
          console.log("Restored applied coupon:", coupon.code);
        }
      }
    }
  }, [checkoutData, allCoupons]);

  // Trigger side cannons confetti effect
  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = [
      "#a786ff",
      "#fd8bbc",
      "#eca184",
      "#f8deb1",
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
    ];

    const frame = () => {
      if (Date.now() > end) return;

      // Left cannon - more particles and better spread
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 70,
        startVelocity: 80,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });

      // Right cannon - more particles and better spread
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 70,
        startVelocity: 80,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  // Handle coupon application
  const handleApplyCoupon = async (coupon: Coupon | null) => {
    setAppliedCoupon(coupon);
    onCouponApplied?.(coupon);

    if (coupon && checkoutData) {
      // Prevent double-discounting: check if items already have discounts
      if (hasExistingDiscounts) {
        console.warn(
          "Cannot apply coupon: items already have discounts applied"
        );
        return;
      }

      // Calculate discounted prices for applicable items
      const updatedItems = checkoutData.items.map((item: any) => {
        const isApplicable = isCouponApplicableToItem(item, coupon);

        if (isApplicable) {
          // Use original_price if available, otherwise use current unit_price
          const originalPrice = item.original_price || item.unit_price || 0;
          let discountAmount = 0;

          if (coupon.type === "percentage") {
            discountAmount = (originalPrice * coupon.value) / 100;
          } else {
            discountAmount = coupon.value;
          }

          const discountedPrice = Math.max(0, originalPrice - discountAmount);

          return {
            ...item,
            unit_price: discountedPrice,
            original_price: originalPrice, // Keep original price for reference
            discount_amount: discountAmount,
            coupon_applied: coupon.code,
          };
        }

        return item;
      });

      // Calculate total discount
      const totalDiscount = updatedItems.reduce((total: number, item: any) => {
        return total + (item.discount_amount || 0) * (item.quantity || 1);
      }, 0);

      // Update checkout data with discounted prices
      const updatedCheckoutData = {
        ...checkoutData,
        items: updatedItems,
        couponCode: coupon.code,
        discount: totalDiscount,
      };

      onCheckoutDataUpdate?.(updatedCheckoutData);

      // Update backend checkout session with discount information
      try {
        const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: updatedItems,
            couponCode: coupon.code,
            discount: totalDiscount,
          }),
        });

        if (updateResponse.ok) {
          console.log("✅ Coupon discount updated in backend checkout session");
        } else {
          console.error("❌ Failed to update coupon discount in backend");
        }
      } catch (updateError) {
        console.error("❌ Error updating backend with coupon:", updateError);
      }

      // Show success popup with savings amount
      setSavingsAmount(totalDiscount);
      setShowSuccessPopup(true);
      setAnimationComplete(false);

      // Trigger confetti effect with a small delay to ensure it works properly
      setTimeout(() => {
        triggerConfetti();
      }, 100);

      // Auto-close popup disabled for design purposes
      // setTimeout(() => {
      //   setShowSuccessPopup(false);
      //   setAnimationComplete(false);
      // }, 3000);
    } else if (!coupon && checkoutData) {
      // Remove coupon - restore original prices
      const updatedItems = checkoutData.items.map((item: any) => {
        if (item.original_price !== undefined) {
          return {
            ...item,
            unit_price: item.original_price,
            original_price: undefined,
            discount_amount: undefined,
            coupon_applied: undefined,
          };
        }
        return item;
      });

      const updatedCheckoutData = {
        ...checkoutData,
        items: updatedItems,
        couponCode: undefined,
        discount: 0,
      };

      onCheckoutDataUpdate?.(updatedCheckoutData);

      // Update backend checkout session to remove discount information
      (async () => {
        try {
          const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: updatedItems,
              couponCode: null,
              discount: 0,
            }),
          });

          if (updateResponse.ok) {
            console.log("✅ Coupon removed from backend checkout session");
          } else {
            console.error("❌ Failed to remove coupon from backend");
          }
        } catch (updateError) {
          console.error("❌ Error removing coupon from backend:", updateError);
        }
      })();
    }
  };

  // Helper function to check if coupon is applicable to an item
  const isCouponApplicableToItem = (item: any, coupon: Coupon): boolean => {
    if (!coupon.apply_to_specific) {
      return true; // Coupon applies to all items
    }

    if (
      coupon.restriction_type === "categories" &&
      coupon.applicable_categories
    ) {
      const categoryId = getCategoryId(item.category || "");
      return categoryId
        ? coupon.applicable_categories.includes(categoryId)
        : false;
    }

    if (coupon.restriction_type === "products" && coupon.applicable_products) {
      const productId = parseInt(item.product_id || "0");
      return coupon.applicable_products.includes(productId);
    }

    return false;
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `Unknown (${categoryId})`;
  };

  // Helper function to get category ID by name
  const getCategoryId = (categoryName: string): string | null => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category ? category.id : null;
  };

  // Check if coupon is applicable to cart items
  const isCouponApplicable = (coupon: Coupon, items: CartItem[]): boolean => {
    // If coupon doesn't apply to specific products/categories, it's applicable to all
    if (!coupon.apply_to_specific) {
      return true;
    }

    // If no cart items, coupon is not applicable
    if (items.length === 0) {
      return false;
    }

    // Check category-based restrictions
    if (
      coupon.restriction_type === "categories" &&
      coupon.applicable_categories
    ) {
      return items.some((item) =>
        coupon.applicable_categories!.includes(item.category_id)
      );
    }

    // Check product-based restrictions
    if (coupon.restriction_type === "products" && coupon.applicable_products) {
      return items.some((item) =>
        coupon.applicable_products!.includes(item.product_id)
      );
    }

    return false;
  };

  // Fetch featured coupon and cart data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch coupons, cart data, and categories in parallel
        const [couponsResponse, checkoutResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/coupons"),
            fetch(`/api/checkout/${checkoutId}`),
            fetch("/api/categories"),
          ]);

        if (
          couponsResponse.ok &&
          checkoutResponse.ok &&
          categoriesResponse.ok
        ) {
          const [coupons, checkoutData, categoriesData] = await Promise.all([
            couponsResponse.json(),
            checkoutResponse.json(),
            categoriesResponse.json(),
          ]);

          // Helper function to get category ID by name using the fetched categories
          const getCategoryIdFromData = (
            categoryName: string
          ): string | null => {
            const category = categoriesData.categories?.find(
              (cat: any) => cat.name === categoryName
            );
            return category ? category.id : null;
          };

          // Extract cart items from checkout data
          const items: CartItem[] =
            checkoutData.checkout?.items?.map((item: any) => {
              const categoryId = getCategoryIdFromData(item.category);
              return {
                product_id: parseInt(item.product_id), // Convert to number
                category_id: categoryId || item.category, // Use category ID if found, fallback to name
                product_name: item.product_name,
                category_name: item.category, // Use category field as category_name
              };
            }) || [];

          setCartItems(items);
          setAllCoupons(coupons);
          setCategories(categoriesData.categories || []);

          // Find the first active coupon that's currently valid and applicable
          const now = new Date();
          const applicableCoupon = coupons.find((coupon: Coupon) => {
            const isValid =
              coupon.is_active &&
              new Date(coupon.valid_from) <= now &&
              new Date(coupon.valid_until) >= now;

            return isValid && isCouponApplicable(coupon, items);
          });

          setFeaturedCoupon(applicableCoupon || null);
        }
      } catch (error) {
        console.error("Error fetching coupon and cart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [checkoutId]);
  // Don't render the component if no coupons are applicable and not loading
  if (!loading && !featuredCoupon && !appliedCoupon && !hasExistingDiscounts) {
    return null;
  }

  return (
    <>
      <div className="bg-white mx-4 rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden">
        {/* Top Header Area - White to Blue Gradient */}
        <div className="bg-gradient-to-r from-white to-[#CEDEFF] relative px-4 py-3">
          {/* Light rays effect */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>

          <div className="flex items-center justify-between relative z-10">
            {/* Left side text */}
            <div className="text-gray-800 flex gap-1 md:flex-row flex-col">
              <div className="font-medium text-md  text-[#2676FF] leading-tight">
                Save extra by applying
              </div>
              <div className="font-medium text-md  text-[#2676FF] leading-tight">
                coupons on every order
              </div>
            </div>

            {/* Right side offer icon */}
            <div className="w-6 h-6 flex items-center justify-center">
              <img
                src="/svg/icons/offer.svg"
                alt="Offer"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Bottom Content Area - White Background */}
        <div className="px-4 py-3 flex items-center justify-between">
          {loading ? (
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <TicketSale className="h-5 w-5 mr-2" />
                <span className="text-gray-800 font-medium">
                  Loading coupon...
                </span>
              </div>
            </div>
          ) : featuredCoupon ? (
            <>
              <div className="flex-1">
                {/* Coupon offer */}
                <div className="flex items-center mb-2">
                  <TicketSale className="h-5 w-5 mr-2" />
                  <span className="text-gray-800 font-medium">
                    {appliedCoupon || hasExistingDiscounts ? (
                      <>
                        Applied{" "}
                        <span className="font-bold text-green-600">
                          '
                          {appliedCoupon?.code ||
                            checkoutData?.items?.find(
                              (item: any) => item.coupon_applied
                            )?.coupon_applied}
                          '
                        </span>
                      </>
                    ) : (
                      <>
                        Save{" "}
                        {featuredCoupon.type === "percentage"
                          ? `${featuredCoupon.value}%`
                          : `₹${featuredCoupon.value}`}{" "}
                        with{" "}
                        <span className="font-bold">
                          '{featuredCoupon.code}'
                        </span>
                      </>
                    )}
                  </span>
                </div>

                {/* View all coupons link */}
                <div className="flex items-center">
                  <Link
                    href={`/checkouts/${checkoutId}/coupons`}
                    className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
                  >
                    View all coupons
                  </Link>
                  <IoIosArrowForward className="h-3 w-3 text-red-500 ml-1" />
                </div>
              </div>

              {/* APPLY/REMOVE Button */}
              <button
                className={`border rounded-lg text-sm font-semibold px-4 py-1 ${
                  appliedCoupon || hasExistingDiscounts
                    ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100"
                    : "border-[#2676FF] text-[#2676FF] bg-[#2676FF]/10 hover:bg-[#2676FF]/20"
                }`}
                onClick={() => {
                  if (appliedCoupon || hasExistingDiscounts) {
                    handleApplyCoupon(null); // Remove coupon
                  } else if (featuredCoupon) {
                    handleApplyCoupon(featuredCoupon); // Apply coupon
                  }
                }}
              >
                {appliedCoupon || hasExistingDiscounts ? "REMOVE" : "APPLY"}
              </button>
            </>
          ) : (
            /* No applicable coupon - show only View all coupons button */
            <div className="flex-1">
              <div className="flex items-center justify-center mb-3">
                <Link
                  href={`/checkouts/${checkoutId}/coupons`}
                  className="flex items-center text-gray-500 text-sm hover:text-gray-700 transition-colors"
                >
                  View all coupons
                  <IoIosArrowForward className="h-3 w-3 text-red-500 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl mx-4 max-w-sm w-full text-center relative overflow-hidden flex flex-col gap-2">
              {/* Content */}
              <div className="relative z-10 p-5 pt-3">
                <div className="w-52 h-52 flex items-center justify-center mx-auto mb-[-30px] mt-[-40px]">
                  {animationData && (
                    <Lottie
                      animationData={animationData}
                      loop={false}
                      autoplay={true}
                      onComplete={() => setAnimationComplete(true)}
                      style={{ width: 200, height: 200 }}
                    />
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {appliedCoupon?.code} Applied!
                </h3>

                <p className="text-lg text-green-600 font-semibold">
                  You saved ₹{savingsAmount.toFixed(0)}
                </p>
              </div>
              <div className="flex items-center justify-center py-3 border-t border-gray-200 text-[#ff424b] text-medium text-[16px]">
                Woohoo! You Got it ❤️
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
