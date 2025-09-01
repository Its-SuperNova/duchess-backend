"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import confirmAnimation from "@/public/Lottie/confirm.json";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
    </div>
  ),
});

interface CheckoutSuccessOverlayProps {
  orderId: string;
  isVisible: boolean;
  onAnimationComplete: () => void;
}

export default function CheckoutSuccessOverlay({
  orderId,
  isVisible,
  onAnimationComplete,
}: CheckoutSuccessOverlayProps) {
  const router = useRouter();
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (isVisible && !animationStarted) {
      setAnimationStarted(true);

      // Navigate to confirmation page after animation completes
      const timer = setTimeout(() => {
        onAnimationComplete();
        router.replace(`/checkout/confirmation?orderId=${orderId}`);
      }, 4000); // 4 seconds for animation to complete

      return () => clearTimeout(timer);
    }
  }, [isVisible, animationStarted, orderId, router, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
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

            {/* Loading indicator for smooth transition */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <span className="text-sm ml-2">
                  Preparing your order details...
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
