"use client";

import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useState } from "react";

export default function CouponsClient() {
  const { cart, getSubtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");

  // Ensure subtotal is a number with fallback
  const currentSubtotal = getSubtotal() || 0;

  const availableCoupons = [
    {
      id: 1,
      code: "FIRSTBITE",
      discount: "Flat ₹100 OFF",
      type: "percentage",
      minOrder: 159,
      discountAmount: 80,
      description: "Get 50% off on orders above ₹599. Maximum discount: ₹100.",
      currentCart: currentSubtotal,
    },

  ];

  const handleApplyCoupon = (code: string) => {
    // Handle coupon application logic here
    console.log("Applying coupon:", code);
  };

  const handleApplyCode = () => {
    if (couponCode.trim()) {
      handleApplyCoupon(couponCode.trim());
      setCouponCode("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FB]">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/checkout">
              <div className="bg-white p-3 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                <IoIosArrowBack className="h-5 w-5 text-gray-700" />
              </div>
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-900 uppercase">
                Apply Coupon
              </h1>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-md mx-auto px-4 py-6">
        {/* Coupon Code Input */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="h-12 text-base pl-4  rounded-full"
            />
            <Button
              onClick={handleApplyCode}
              disabled={!couponCode.trim()}
              className={`absolute right-1 top-1 px-4 h-10 text-sm bg-white ${
                couponCode.trim()
                  ? "text-[#921c1c]"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* More Offers Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">More offers</h2>
          <div className="space-y-4">
            {availableCoupons.map((coupon) => {
              const needsMore = coupon.minOrder > coupon.currentCart;
              const moreNeeded = coupon.minOrder - coupon.currentCart;

              return (
                <div key={coupon.id} className="w-full max-w-sm mx-auto">
                  <div className="relative bg-white rounded-xl  overflow-hidden">
                    {/* Orange left section with perforated edge */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-[#921c1c] flex items-center justify-center">
                      {/* Perforated circles on the left edge - only 4 circles centered */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 bg-[#f5f6fa] rounded-full -ml-1.5 mb-2 last:mb-0"
                          />
                        ))}
                      </div>

                      {/* Vertical "FLAT OFF" text */}
                      <div className="text-white font-bold text-sm tracking-wider transform -rotate-90 whitespace-nowrap">
                        {coupon.discount}
                      </div>
                    </div>

                    {/* Main content area */}
                    <div className="ml-20 p-4">
                      {/* Header with coupon code and REMOVE */}
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-800">
                          {coupon.code}
                        </h2>
                        <button className="text-[#921c1c] font-semibold text-sm ">
                          Apply
                        </button>
                      </div>

                      {/* Save amount */}
                      <div className="mb-2">
                        {needsMore ? (
                          <p className="text-gray-500 text-sm">
                            Add ₹{moreNeeded} more to avail this offer
                          </p>
                        ) : (
                          <p className="text-lg font-semibold text-green-600">
                            Save ₹{coupon.discountAmount} on this order!
                          </p>
                        )}
                      </div>

                      {/* Dotted separator */}
                      <div className="border-t-2 border-dotted border-gray-300 mb-2"></div>

                      {/* Description */}
                      <div className="">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Use code {coupon.code} and {coupon.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
