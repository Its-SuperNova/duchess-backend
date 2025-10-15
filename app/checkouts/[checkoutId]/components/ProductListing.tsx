"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { TrashBinTrash } from "@solar-icons/react";

interface ProductItem {
  id?: string;
  product_id?: string;
  uniqueId?: string;
  name?: string;
  product_name?: string;
  image?: string;
  product_image?: string;
  price?: number;
  unit_price?: number;
  quantity?: number;
  category?: string;
  variant?: string;
  // Discount fields
  original_price?: number | null;
  discount_amount?: number | null;
  coupon_applied?: string | null;
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

interface ProductListingProps {
  items: ProductItem[];
  checkoutData?: any;
  onRemoveItem?: (uid: string) => void;
  onUpdateQuantity?: (uid: string, quantity: number) => void;
  onUpdateCheckoutData?: (data: any) => void;
  appliedCoupon?: Coupon | null;
  categories?: Array<{ id: string; name: string }>;
}

export default function ProductListing({
  items,
  checkoutData,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateCheckoutData,
  appliedCoupon,
  categories = [],
}: ProductListingProps) {
  // Helper function to get category ID by name
  const getCategoryId = (categoryName: string): string | null => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category ? category.id : null;
  };

  // Check if coupon is applicable to a specific item
  const isCouponApplicableToItem = (item: ProductItem): boolean => {
    if (!appliedCoupon || !appliedCoupon.apply_to_specific) {
      return true; // Coupon applies to all items
    }

    if (
      appliedCoupon.restriction_type === "categories" &&
      appliedCoupon.applicable_categories
    ) {
      const categoryId = getCategoryId(item.category || "");
      return categoryId
        ? appliedCoupon.applicable_categories.includes(categoryId)
        : false;
    }

    if (
      appliedCoupon.restriction_type === "products" &&
      appliedCoupon.applicable_products
    ) {
      const productId = checkoutData
        ? parseInt(item.product_id || "0")
        : parseInt(item.id || "0");
      return appliedCoupon.applicable_products.includes(productId);
    }

    return false;
  };

  // Calculate discount for an item
  const calculateItemDiscount = (item: ProductItem) => {
    const originalPrice = checkoutData ? item.unit_price || 0 : item.price || 0;

    // If checkout data has discount information, use it
    if (checkoutData && item.original_price !== undefined) {
      return {
        originalPrice: item.original_price,
        discountedPrice: item.unit_price || 0,
        discountAmount: item.discount_amount || 0,
      };
    }

    // Fallback to visual-only calculation for display
    if (!appliedCoupon || !isCouponApplicableToItem(item)) {
      return {
        originalPrice,
        discountedPrice: originalPrice,
        discountAmount: 0,
      };
    }
    let discountAmount = 0;

    if (appliedCoupon.type === "percentage") {
      discountAmount = (originalPrice * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }

    const discountedPrice = Math.max(0, originalPrice - discountAmount);

    return {
      originalPrice,
      discountedPrice,
      discountAmount,
    };
  };

  // Calculate total savings
  const calculateTotalSavings = () => {
    return items.reduce((total, item) => {
      const { discountAmount } = calculateItemDiscount(item);
      const quantity = item.quantity || 1;
      return total + discountAmount * quantity;
    }, 0);
  };

  const handleQuantityChange = (
    item: ProductItem,
    index: number,
    newQuantity: number
  ) => {
    if (checkoutData) {
      // Update checkout data quantity
      const newItems = checkoutData.items.map(
        (checkoutItem: any, idx: number) =>
          idx === index
            ? {
                ...checkoutItem,
                quantity: newQuantity,
              }
            : checkoutItem
      );
      onUpdateCheckoutData?.({
        ...checkoutData,
        items: newItems,
      });
    } else {
      // Update cart quantity
      const uid = item.uniqueId || `${item.id}-${item.variant}`;
      onUpdateQuantity?.(uid, newQuantity);
    }
  };

  const handleRemoveItem = (item: ProductItem) => {
    const uid = checkoutData
      ? `${item.product_id}-${items.indexOf(item)}`
      : item.uniqueId || `${item.id}-${item.variant}`;
    onRemoveItem?.(uid);
  };

  return (
    <div className="space-y-4">
      {items.map((item: ProductItem, index: number) => {
        const uid = checkoutData
          ? `${item.product_id}-${index}`
          : ((item.uniqueId || `${item.id}-${item.variant}`) as string);
        const qty = item.quantity || 1;

        return (
          <div key={uid} className="flex items-start justify-between">
            <div className="flex w-full min-w-0">
              {/* Product Image */}
              <div className="relative h-[88px] w-[88px] rounded-[20px] overflow-hidden mr-3 shrink-0">
                <Image
                  src={
                    (checkoutData ? item.product_image : item.image) ||
                    "/placeholder.svg?height=88&width=88&query=food%20thumbnail"
                  }
                  alt={
                    checkoutData
                      ? item.product_name || "Product"
                      : item.name || "Product"
                  }
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                {/* Top Row */}
                <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
                  {/* Name and Category */}
                  <div className="flex-1 w-full min-w-0">
                    {/* Single-line name with ellipsis */}
                    <h3
                      className="block truncate text-[15px] leading-tight font-medium text-black dark:text-gray-200"
                      title={checkoutData ? item.product_name : item.name}
                    >
                      {checkoutData ? item.product_name : item.name}
                    </h3>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 truncate max-w-full">
                      {checkoutData
                        ? item.category || item.variant
                        : item.category ?? item.variant}
                    </p>
                  </div>

                  {/* Remove Button - Only show for cart items, not checkout data */}
                  {!checkoutData && (
                    <button
                      aria-label="Remove item"
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 self-start"
                      onClick={() => handleRemoveItem(item)}
                    >
                      <TrashBinTrash className="h-5 w-5 text-red-600" />
                    </button>
                  )}
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between w-full">
                  {/* Price */}
                  <div className="flex flex-col">
                    {(() => {
                      const { originalPrice, discountedPrice, discountAmount } =
                        calculateItemDiscount(item);
                      const isDiscounted = discountAmount > 0;

                      if (isDiscounted) {
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-[16px] font-semibold text-black dark:text-gray-100">
                                ₹{discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-[14px] text-red-500 line-through">
                                ₹{(originalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <span className="text-[16px] font-semibold text-black dark:text-gray-100">
                            ₹{(originalPrice || 0).toFixed(2)}
                          </span>
                        );
                      }
                    })()}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-[#F5F4F7] rounded-full p-1 shrink-0">
                    <button
                      aria-label="Decrease quantity"
                      className="w-[26px] h-[26px] flex items-center justify-center rounded-full border border-gray-200 bg-white transition-colors"
                      onClick={() =>
                        handleQuantityChange(item, index, Math.max(1, qty - 1))
                      }
                    >
                      <Minus className="h-3 w-3 text-gray-600" />
                    </button>
                    <span className="font-medium text-gray-900 dark:text-white min-w-[24px] text-center text-[12px]">
                      {String(qty).padStart(2, "0")}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      className="w-[26px] h-[26px] flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                      onClick={() => handleQuantityChange(item, index, qty + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Savings Banner */}
      {appliedCoupon && calculateTotalSavings() > 0 && (
        <div className="bg-green-100 rounded-lg p-3 mt-4">
          <div className="flex items-center justify-center">
            <span className="text-green-700 font-medium text-sm">
              You have saved ₹{calculateTotalSavings().toFixed(0)} 🎉
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
