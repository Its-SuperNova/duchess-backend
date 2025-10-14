"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

interface PaymentSectionProps {
  className?: string;
}

export default function PaymentSection({
  className = "",
}: PaymentSectionProps) {
  // Lottie animation state for payment section
  const [paymentAnimationData, setPaymentAnimationData] = useState(null);

  // Load payment animation data
  useEffect(() => {
    const loadPaymentAnimation = async () => {
      try {
        const response = await fetch("/Lottie/Digital Payment.json");
        const data = await response.json();
        setPaymentAnimationData(data);
      } catch (error) {
        console.error("Failed to load payment animation:", error);
      }
    };

    loadPaymentAnimation();
  }, []);

  return (
    <div
      className={`bg-white p-4 rounded-[22px] border border-gray-200 dark:border-gray-600 ${className}`}
    >
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex items-start gap-6">
          {/* Lottie animation on the left */}
          <div className="flex-1">
            {paymentAnimationData && (
              <Lottie
                animationData={paymentAnimationData}
                loop={true}
                style={{ width: "100%", height: "200px" }}
              />
            )}
          </div>

          {/* Content on the right */}
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
              Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              All transactions are secure and encrypted
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              After clicking "Pay now", you will be redirected to{" "}
              <span className="font-medium text-[#2664eb]">
                Secure Payment Gateway
              </span>{" "}
              (UPI, Cards, Wallets, NetBanking) to complete your purchase
              securely.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
          Payment
        </h3>
        {/* Lottie animation below the title */}
        <div className="mt-3">
          {paymentAnimationData && (
            <Lottie
              animationData={paymentAnimationData}
              loop={true}
              style={{ width: "100%", height: "250px" }}
            />
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
          All transactions are secure and encrypted
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          After clicking "Pay now", you will be redirected to{" "}
          <span className="font-medium text-[#2664eb]">
            Secure Payment Gateway
          </span>{" "}
          (UPI, Cards, Wallets, NetBanking) to complete your purchase securely.
        </p>
      </div>
    </div>
  );
}
