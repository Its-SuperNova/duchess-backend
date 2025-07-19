"use client";

import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useState, useEffect } from "react";
import { Coupon } from "@/lib/supabase";
import { toast } from "sonner";

export default function CouponsClient() {
  const { cart, getSubtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Ensure subtotal is a number with fallback
  const currentSubtotal = getSubtotal() || 0;

  // Fetch coupons from database
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      // Fetch only active and currently valid coupons
      const response = await fetch("/api/coupons/active");
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      const data = await response.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Only show coupons that are active and valid now (defensive, API already filters)
  const now = new Date();
  const availableCoupons = coupons.filter((c) => {
    const validFrom = new Date(c.valid_from);
    const validUntil = new Date(c.valid_until);
    return c.is_active && now >= validFrom && now <= validUntil;
  });

  const handleApplyCoupon = (code: string) => {
    // Find the coupon in the available coupons
    const coupon = availableCoupons.find((c) => c.code === code);

    if (!coupon) {
      toast.error("Coupon not found");
      return;
    }

    // Check if minimum order amount is met
    if (currentSubtotal < coupon.min_order_amount) {
      const moreNeeded = coupon.min_order_amount - currentSubtotal;
      toast.error(`Add ₹${moreNeeded} more to apply this coupon`);
      return;
    }

    // Check if coupon is still valid
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom || now > validUntil) {
      toast.error("This coupon is not valid at the moment");
      return;
    }

    // Calculate discount amount
    const discountAmount =
      coupon.type === "percentage"
        ? Math.min(
            (currentSubtotal * coupon.value) / 100,
            coupon.max_discount_cap || Infinity
          )
        : coupon.value;

    // Here you would typically update the cart context with the applied coupon
    // For now, persist the applied coupon for checkout to consume
    try {
      const toStore = {
        id: coupon.id, // Add the coupon ID for database relationship
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_order_amount: coupon.min_order_amount,
        max_discount_cap: coupon.max_discount_cap,
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
      };
      localStorage.setItem("appliedCoupon", JSON.stringify(toStore));
    } catch {}

    // Show a success message
    toast.success(
      `Coupon ${code} applied! You'll save ₹${Math.round(discountAmount)}`
    );

    // Navigate back to checkout
    try {
      window.history.back();
    } catch {}
    console.log("Applying coupon:", code, "Discount:", discountAmount);
  };

  const handleApplyCode = () => {
    if (couponCode.trim()) {
      handleApplyCoupon(couponCode.trim().toUpperCase());
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading coupons...</p>
              </div>
            ) : availableCoupons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No coupons available at the moment
              </div>
            ) : (
              availableCoupons.map((coupon, index) => {
                const needsMore = coupon.min_order_amount > currentSubtotal;
                const moreNeeded = coupon.min_order_amount - currentSubtotal;

                // Calculate discount display text
                const discountText =
                  coupon.type === "percentage"
                    ? `${coupon.value}% OFF`
                    : `₹${coupon.value} OFF`;

                // Calculate maximum discount amount for percentage coupons
                const maxDiscount =
                  coupon.max_discount_cap ||
                  (coupon.type === "percentage"
                    ? (currentSubtotal * coupon.value) / 100
                    : coupon.value);

                // Calculate actual discount amount
                const actualDiscount =
                  coupon.type === "percentage"
                    ? Math.min(
                        (currentSubtotal * coupon.value) / 100,
                        maxDiscount
                      )
                    : coupon.value;

                return (
                  <div key={coupon.id} className="w-full max-w-sm mx-auto">
                    <div className="relative bg-white rounded-xl overflow-hidden">
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

                        {/* Vertical discount text */}
                        <div className="text-white font-bold text-sm tracking-wider transform -rotate-90 whitespace-nowrap">
                          {discountText}
                        </div>
                      </div>

                      {/* Main content area */}
                      <div className="ml-20 p-4">
                        {/* Header with coupon code and Apply button */}
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-bold text-gray-800">
                            {coupon.code}
                          </h2>
                          <button
                            className="text-[#921c1c] font-semibold text-sm"
                            onClick={() => handleApplyCoupon(coupon.code)}
                          >
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
                              Save ₹{Math.round(actualDiscount)} on this order!
                            </p>
                          )}
                        </div>

                        {/* Dotted separator */}
                        <div className="border-t-2 border-dotted border-gray-300 mb-2"></div>

                        {/* Description */}
                        <div className="">
                          <p className="text-gray-600 text-sm leading-relaxed">
                            Use code {coupon.code} and get {discountText} on
                            orders above ₹{coupon.min_order_amount || 0}
                            {coupon.max_discount_cap &&
                              coupon.type === "percentage" && (
                                <span>
                                  . Maximum discount: ₹{coupon.max_discount_cap}
                                </span>
                              )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
