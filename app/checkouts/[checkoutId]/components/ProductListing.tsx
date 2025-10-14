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
}

interface ProductListingProps {
  items: ProductItem[];
  checkoutData?: any;
  onRemoveItem?: (uid: string) => void;
  onUpdateQuantity?: (uid: string, quantity: number) => void;
  onUpdateCheckoutData?: (data: any) => void;
}

export default function ProductListing({
  items,
  checkoutData,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateCheckoutData,
}: ProductListingProps) {
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
                  <p className="text-[16px] font-semibold text-black dark:text-gray-100">
                    ₹{(checkoutData ? item.unit_price : item.price)?.toFixed(2)}
                  </p>

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
    </div>
  );
}
