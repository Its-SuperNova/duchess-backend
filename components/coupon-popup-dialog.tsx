"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CouponPopupDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup on every reload after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        {/* Transparent overlay - no dark background */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Dialog content with shadow only */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-[90vw] md:max-w-[600px] translate-x-[-50%] translate-y-[-50%] p-0 duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Special Coupon Offer
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Get amazing discounts with our special coupon offers
          </DialogPrimitive.Description>

          {/* Banner image with shadow */}
          <div className="relative w-full h-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/duchess-coupon.png"
              alt="Special Coupon Offer"
              width={600}
              height={400}
              className="w-full h-auto object-contain rounded-2xl"
              priority
            />
          </div>

          {/* Close button */}
          <DialogPrimitive.Close className="absolute -top-3 -right-3 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg hover:bg-gray-100 focus:outline-none border-0 transition-colors">
            <X className="h-4 w-4 text-gray-600" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
