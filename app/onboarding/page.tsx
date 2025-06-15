"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DesktopOnboarding from "./desktop-onboarding";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface OnboardingPageProps {
  onOnboardingComplete?: () => void;
}

export default function Page({ onOnboardingComplete }: OnboardingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  // Handle initialization to prevent flash
  useEffect(() => {
    // Small delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const slides = [
    {
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kERUD6weemAlwTw0hfsLKEjSy6E3Rj.png",
      title: "Welcome to Duchess Pastries!",
      description: "Delicious treats delivered fresh to your doorstep.",
    },
    {
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L00pt3cb8cIb9QOQWnCAoQlTOgj2Md.png",
      title: "Order in Minutes",
      description:
        "Choose your favorites and order by piece or weight — quick, simple, and convenient.",
    },
    {
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DcWDov6f12bJbdTkLZbJ9jegATwWGR.png",
      title: "Quick & Safe Delivery",
      description:
        "We deliver fresh bakes across Coimbatore with speed, care, and hygiene.",
    },
    {
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iy3gO8PNtumgtTzRXpgglh8AtGNoaE.png",
      title: "Pastries Made Personal",
      description:
        "Save your favorites, get custom suggestions, and reorder in one tap.",
    },
    {
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0ZbZnveANurqmOeZrfB4GqQnPCo582.png",
      title: "100% Fresh & Trusted",
      description:
        "Made with premium ingredients and trusted by thousands for quality and taste.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setImageOpacity(0); // Start fade out
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
      }, 300); // Match this with CSS transition duration
    } else {
      // On the last slide, complete onboarding and redirect to login
      handleOnboardingComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setImageOpacity(0); // Start fade out
      setTimeout(() => {
        setCurrentSlide((prev) => prev - 1);
      }, 300); // Match this with CSS transition duration
    }
  };

  const handleSkip = () => {
    // Skip to login
    handleOnboardingComplete();
  };

  const handleOnboardingComplete = () => {
    if (onOnboardingComplete) {
      onOnboardingComplete();
    }
    // Redirect to login page
    router.push("/login");
  };

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  // Don't render anything until properly initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        {/* Minimal loading to prevent flash - matches onboarding background */}
      </div>
    );
  }

  // If desktop (not mobile), render DesktopOnboarding
  if (!isMobile) {
    return (
      <DesktopOnboarding onOnboardingComplete={handleOnboardingComplete} />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#ffffff] text-[#010101] font-sans overflow-hidden">
      {/* Hero Section with Image and Concave Bottom */}
      <div className="relative w-full flex-grow flex flex-col justify-end">
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{ opacity: imageOpacity }}
        >
          <Image
            src={currentSlideData.imageSrc || "/placeholder.svg"}
            alt={currentSlideData.title}
            width={400}
            height={600}
            className="absolute inset-0 w-full h-full object-cover"
            priority
            onLoadingComplete={() => setImageOpacity(1)} // Fade in when new image loads
          />
        </div>
        {/* SVG for the concave U-shaped curve */}
        <svg
          className="absolute bottom-0 left-0 w-full h-auto mb-[-5px]"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          fill="#ffffff"
          style={{ zIndex: 1 }}
        >
          <path d="M0,0 Q50,20 100,0 L100,20 L0,20 Z" />
        </svg>
      </div>

      {/* Content and Navigation Section - Fixed Height */}
      <motion.div // Added motion.div for animation
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }} // Small delay after splash screen
        className="flex flex-col items-center text-center px-6 pt-12 pb-8"
        style={{ height: "300px" }}
      >
        <h1 className="text-3xl font-bold mb-2">{currentSlideData.title}</h1>
        <p className="text-[#747577] text-lg max-w-sm mb-auto">
          {currentSlideData.description}
        </p>
        {/* Navigation/Pagination */}
        <div className="flex items-center justify-between w-full mt-auto">
          {currentSlide === 0 ? (
            <Button
              variant="link"
              className="text-[#747577] text-lg font-semibold p-0 h-auto"
              onClick={handleSkip}
            >
              Skip
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-[#747577] text-lg font-semibold p-0 h-auto flex items-center gap-1"
              onClick={handleBack}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-5 w-5" /> Back
            </Button>
          )}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-6 bg-[#7a0000]"
                    : "w-2 bg-[#dadada]"
                }`}
              ></span>
            ))}
          </div>
          <Button
            className="w-14 h-14 rounded-full bg-[#7a0000] hover:bg-[#6a0000] text-[#ffffff] flex items-center justify-center"
            onClick={handleNext}
          >
            {isLastSlide ? (
              <span className="text-sm font-semibold">Start</span>
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
