"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, RefreshCw, ShoppingCart } from "lucide-react";
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

interface CheckoutExpiryScreenProps {
  checkoutId: string;
}

export default function CheckoutExpiryScreen({
  checkoutId,
}: CheckoutExpiryScreenProps) {
  const router = useRouter();

  const handleRecreateCheckout = () => {
    // Redirect to cart page to recreate checkout
    router.push("/cart");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F6FB] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg bg-white">
        <CardContent className="p-8 text-center">
          {/* Clock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Checkout Session Expired
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your checkout session has expired after 30 minutes. This helps keep
            your information secure and ensures fresh pricing.
          </p>

          {/* Session ID (for debugging) */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-500 mb-1">Session ID:</p>
            <p className="text-sm font-mono text-gray-700 break-all">
              {checkoutId}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRecreateCheckout}
              className="w-full bg-[#523435] hover:bg-[#4a2a2a] text-white py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recreate Checkout
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full py-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Back to Shopping
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            Don't worry, your cart items are still saved and ready for checkout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
