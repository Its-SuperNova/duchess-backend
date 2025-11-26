"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CouponPopupDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Fallback: Show popup after 3 seconds regardless of image load status
    const fallbackTimer = setTimeout(() => {
      console.log("Fallback timer triggered - showing popup");
      setIsOpen(true);
    }, 3000);

    // Show popup after image is loaded
    if (isImageLoaded) {
      console.log("Image loaded - showing popup");
      clearTimeout(fallbackTimer);
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500); // Small delay for smooth appearance

      return () => clearTimeout(timer);
    }

    return () => clearTimeout(fallbackTimer);
  }, [isImageLoaded]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleImageLoad = () => {
    console.log("Image load event fired");
    setIsImageLoaded(true);
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const popupVariants = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.3,
      y: 50,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const closeButtonVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.4,
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12 bg-transparent"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-[95vw] lg:max-w-[1000px] h-auto"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner image with shadow - Responsive images */}
            <motion.div
              className="relative w-full h-auto rounded-2xl overflow-hidden shadow-2xl"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Desktop Image */}
              <Image
                src="https://res.cloudinary.com/dt85dgcrl/image/upload/v1760602355/duchess-coupon_y3dtir.png"
                alt="Special Coupon Offer"
                width={1200}
                height={900}
                className="hidden md:block w-full h-auto object-contain rounded-2xl"
                priority
                onLoad={handleImageLoad}
                onError={() => {
                  console.log("Desktop image failed to load");
                  handleImageLoad(); // Still show popup even if image fails
                }}
              />

              {/* Mobile Image */}
              <Image
                src="https://res.cloudinary.com/dt85dgcrl/image/upload/v1760602354/Diwali_Deals_szlwer.png"
                alt="Diwali Deals Offer"
                width={400}
                height={300}
                className="block md:hidden w-full h-auto object-contain rounded-2xl"
                priority
                onLoad={handleImageLoad}
                onError={() => {
                  console.log("Mobile image failed to load");
                  handleImageLoad(); // Still show popup even if image fails
                }}
              />
            </motion.div>

            {/* Close button */}
            <motion.button
              className="absolute -top-3 -right-3 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg hover:bg-gray-100 focus:outline-none border-0 transition-colors"
              variants={closeButtonVariants}
              initial="hidden"
              animate="visible"
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-4 w-4 text-gray-600" />
              <span className="sr-only">Close</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
