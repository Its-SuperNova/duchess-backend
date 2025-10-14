"use client";

import { Bill } from "@solar-icons/react";
import { Button } from "@/components/ui/button";

interface BillDetailsProps {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  checkoutData?: any;
  selectedAddressId?: string | null;
  isFreeDelivery: boolean;
  isCalculatingDelivery: boolean;
  cgstAmount: number;
  sgstAmount: number;
  total: number;
  taxSettings?: any;
  addressText: string;
  contactInfo: {
    name: string;
    phone: string;
  };
  onPaymentClick: () => void;
  className?: string;
}

export default function BillDetails({
  subtotal,
  discount,
  deliveryCharge,
  checkoutData,
  selectedAddressId,
  isFreeDelivery,
  isCalculatingDelivery,
  cgstAmount,
  sgstAmount,
  total,
  taxSettings,
  addressText,
  contactInfo,
  onPaymentClick,
  className = "",
}: BillDetailsProps) {
  const isDisabled =
    !addressText ||
    addressText === "2nd street, Barathipuram, Kannampalayam" ||
    !contactInfo.name ||
    !contactInfo.phone ||
    isCalculatingDelivery;

  return (
    <div
      className={`bg-white mx-4 p-4 rounded-[22px] border border-gray-200 dark:border-gray-600 ${className}`}
    >
      <div className="flex items-center mb-3 gap-2">
        <Bill className="h-5 w-5 text-[#570000]" />
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          Bill Details
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
          <span>Item Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 text-sm">
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        {/* Delivery Fee - Only show when address is selected */}
        {(selectedAddressId || checkoutData?.selectedAddressId) && (
          <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
            <span>Delivery Fee</span>
            <span
              className={isFreeDelivery ? "text-green-600 font-medium" : ""}
            >
              {isCalculatingDelivery ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                  <span className="text-xs">Calculating...</span>
                </div>
              ) : (checkoutData?.deliveryFee || deliveryCharge) === 0 ? (
                "FREE"
              ) : (
                `₹${(checkoutData?.deliveryFee || deliveryCharge).toFixed(2)}`
              )}
            </span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
          <span>CGST ({taxSettings?.cgst_rate}%)</span>
          <span>₹{cgstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
          <span>SGST ({taxSettings?.sgst_rate}%)</span>
          <span>₹{sgstAmount.toFixed(2)}</span>
        </div>
        <div className="pt-2 mt-2">
          <div className="w-full h-[1.5px] bg-[repeating-linear-gradient(90deg,_rgba(156,163,175,0.5)_0,_rgba(156,163,175,0.5)_8px,_transparent_8px,_transparent_14px)] rounded-full"></div>
          <div className="flex justify-between font-semibold text-black dark:text-white mt-2">
            <span>To Pay</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] text-[16px] font-medium h-auto disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDisabled}
          onClick={onPaymentClick}
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
