"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import confirmAnimation from "@/public/Lottie/confirm.json";
import { useCart } from "@/context/cart-context";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
    </div>
  ),
});

export default function OrderConfirmationAnimation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();

  // Clear cart and checkout context when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear checkout context from localStorage
      localStorage.removeItem("checkoutContext");
      localStorage.removeItem("checkoutNote");
      localStorage.removeItem("checkoutCustomization");
      localStorage.removeItem("checkoutCakeText");
      localStorage.removeItem("checkoutMessageCardText");
    }

    clearCart();
  }, [clearCart]);

  useEffect(() => {
    // Navigate to confirmation page after animation completes
    const timer = setTimeout(() => {
      if (orderId) {
        router.replace("/checkout/confirmation?orderId=" + orderId);
      } else {
        // Fallback if no orderId
        router.replace("/checkout/confirmation");
      }
    }, 4000); // 4 seconds for animation to complete

    return () => clearTimeout(timer);
  }, [router, orderId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#f2f4f7" }}
    >
      <div className="flex flex-col items-center justify-center">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Lottie
            animationData={confirmAnimation}
            loop={false}
            style={{ width: 150, height: 150 }}
            onComplete={() => {}}
          />
        </motion.div>

        {/* Order confirmed text with smooth slide up animation */}
        <motion.p
          className="text-[20px] font-medium text-gray-800 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3,
          }}
        >
          Order Confirmed!
        </motion.p>
      </div>
    </div>
  );
}
