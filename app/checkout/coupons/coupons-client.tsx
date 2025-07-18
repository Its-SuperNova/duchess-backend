"use client";

import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useState, useEffect } from "react";
import { Coupon } from "@/lib/supabase";
import { toast } from "sonner";
import Lottie from "lottie-react";
import couponAnimation from "@/public/Lottie/Coupon.json";

export default function CouponsClient() {
  const { cart, getSubtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

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

  // Load applied coupon from localStorage
  useEffect(() => {
    try {
      const savedCoupon = localStorage.getItem("appliedCoupon");
      if (savedCoupon) {
        const parsedCoupon = JSON.parse(savedCoupon);
        // Check if the saved coupon is still valid for current order
        if (isCouponValid(parsedCoupon)) {
          setAppliedCoupon(parsedCoupon);
        } else {
          // Remove invalid coupon from localStorage
          localStorage.removeItem("appliedCoupon");
          setAppliedCoupon(null);
        }
      }
    } catch (error) {
      console.error("Error loading applied coupon:", error);
    }
  }, [currentSubtotal]); // Re-run when subtotal changes

  // Function to check if a coupon is valid for the current order
  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    return (
      coupon.is_active &&
      now >= validFrom &&
      now <= validUntil &&
      currentSubtotal >= coupon.min_order_amount
    );
  };

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

    // Check if coupon is active
    if (!coupon.is_active) {
      toast.error("This coupon is not active");
      return;
    }

    // Check if coupon is still valid
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      toast.error("This coupon is not yet valid");
      return;
    }

    if (now > validUntil) {
      toast.error("This coupon has expired");
      return;
    }

    // Check if minimum order amount is met
    if (currentSubtotal < coupon.min_order_amount) {
      const moreNeeded = coupon.min_order_amount - currentSubtotal;
      toast.error(`Add ₹${moreNeeded} more to apply this coupon`);
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
      setAppliedCoupon(toStore); // Update local state
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
        <div className="max-w-[1200px] mx-auto px-4 py-4">
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
      <div className="max-w-[1200px] mx-auto px-4 py-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading coupons...</p>
              </div>
            ) : availableCoupons.length === 0 ? (
              <div className="col-span-full text-center pb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-[280px] md:w-[400px] h-[250px] md:h-[350px]">
                    <Lottie
                      animationData={couponAnimation}
                      loop={true}
                      autoplay={true}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No Coupons Available
                    </h3>
                    <p className="text-muted-foreground">
                      Check back later for exciting offers and discounts!
                    </p>
                  </div>
                </div>
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
                  <div key={coupon.id} className="w-full h-full">
                    <div className="relative bg-white rounded-xl overflow-hidden h-full flex flex-col">
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
                      <div className="ml-20 p-4 flex-1 flex flex-col">
                        {/* Header with coupon code and Apply button */}
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-bold text-gray-800">
                            {coupon.code}
                          </h2>
                          {appliedCoupon &&
                          appliedCoupon.code === coupon.code ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                                Applied
                              </span>
                              <button
                                className="text-red-600 font-semibold text-sm hover:text-red-700"
                                onClick={() => {
                                  localStorage.removeItem("appliedCoupon");
                                  setAppliedCoupon(null);
                                  toast.success("Coupon removed");
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : !isCouponValid(coupon) ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-red-500 text-xs font-medium">
                                {currentSubtotal < coupon.min_order_amount
                                  ? `Add ₹${
                                      coupon.min_order_amount - currentSubtotal
                                    } more`
                                  : new Date() < new Date(coupon.valid_from)
                                  ? "Not yet valid"
                                  : new Date() > new Date(coupon.valid_until)
                                  ? "Expired"
                                  : "Not active"}
                              </span>
                              <button
                                className="text-gray-400 font-semibold text-sm cursor-not-allowed"
                                disabled
                              >
                                Apply
                              </button>
                            </div>
                          ) : (
                            <button
                              className="text-[#921c1c] font-semibold text-sm hover:text-[#7a1a1a] transition-colors"
                              onClick={() => handleApplyCoupon(coupon.code)}
                            >
                              Apply
                            </button>
                          )}
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
                        <div className="flex-1">
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
