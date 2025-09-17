"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
// Import framer-motion dynamically to handle SSR
import { motion, AnimatePresence } from "framer-motion";

interface OrderSuccessNotificationProps {
  orderId: string;
  orderNumber?: string;
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function OrderSuccessNotification({
  orderId,
  orderNumber,
  isVisible,
  onClose,
  autoHideDuration = 5000, // 5 seconds default
}: OrderSuccessNotificationProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleViewOrder = () => {
    router.push(`/confirmation?orderId=${orderId}`);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${
          isClosing ? "animate-slide-down" : ""
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Notification Card */}
        <div className="relative bg-white border-t border-gray-200 shadow-2xl mx-4 mb-4 rounded-t-2xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close notification"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-4">
              {/* Success Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Placed Successfully!
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {orderNumber ? (
                    <>Order #{orderNumber} has been confirmed</>
                  ) : (
                    <>Your order has been confirmed and is being processed</>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You'll receive updates via SMS and email
                </p>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={handleViewOrder}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full flex items-center gap-2 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  View Order
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar (Auto-hide indicator) */}
          {autoHideDuration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{
                  duration: autoHideDuration / 1000,
                  ease: "linear",
                }}
                className="h-full bg-primary"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Alternative compact version for mobile
export function CompactOrderSuccessNotification({
  orderId,
  orderNumber,
  isVisible,
  onClose,
  autoHideDuration = 4000,
}: OrderSuccessNotificationProps) {
  const router = useRouter();

  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration]);

  const handleViewOrder = () => {
    router.push(`/confirmation?orderId=${orderId}`);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="bg-green-600 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-white" />
            <div>
              <p className="font-medium text-sm">Order Placed!</p>
              {orderNumber && (
                <p className="text-xs text-green-100">#{orderNumber}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleViewOrder}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-4 text-xs font-medium"
            >
              View Order
            </Button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
