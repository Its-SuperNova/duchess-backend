"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion"; // Import motion

interface DesktopOnboardingProps {
  onOnboardingComplete?: () => void;
}

export default function DesktopOnboarding({
  onOnboardingComplete,
}: DesktopOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1); // State for image fade transition
  const router = useRouter();

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

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4 overflow-hidden">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="w-full max-w-4xl h-full max-h-[566px] overflow-hidden rounded-[32px] bg-white p-3 shadow-2xl md:grid md:grid-cols-2"
      >
        {/* Left Section - Image Slider */}
        <div className="relative hidden h-full md:block">
          <div
            className="absolute inset-0 transition-opacity duration-500 ease-in-out"
            style={{ opacity: imageOpacity }}
          >
            <Image
              src={currentSlideData.imageSrc || "/placeholder.svg"}
              alt={currentSlideData.title}
              layout="fill"
              objectFit="cover"
              className="rounded-[29px]" // Adjusted to fit inside parent's 32px radius
              priority
              onLoadingComplete={() => setImageOpacity(1)} // Fade in when new image loads
            />
          </div>
        </div>

        {/* Right Section - Onboarding Content */}
        <motion.div // Added motion.div for animation
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }} // Small delay after splash screen
          className="flex flex-col items-center justify-center p-8 md:p-12 h-full"
        >
          <div className="w-full max-w-md space-y-6 text-center flex flex-col h-full">
            <CardHeader className="px-0 pt-0 pb-4 flex-grow flex flex-col justify-center">
              <CardTitle className="text-3xl font-semibold text-gray-900">
                {currentSlideData.title}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                {currentSlideData.description}
              </CardDescription>
            </CardHeader>

            {/* Navigation/Pagination */}
            <div className="flex items-center justify-between w-full mt-auto pt-8">
              {currentSlide === 0 ? (
                <Button
                  variant="link"
                  className="text-gray-600 text-lg font-semibold p-0 h-auto"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-gray-600 text-lg font-semibold p-0 h-auto flex items-center gap-1"
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
                        : "w-2 bg-gray-300"
                    }`}
                  ></span>
                ))}
              </div>
              <Button
                className="w-14 h-14 rounded-full bg-[#7a0000] hover:bg-[#6a0000] text-white flex items-center justify-center"
                onClick={handleNext}
              >
                {isLastSlide ? (
                  <span className="text-sm font-semibold">Start</span>
                ) : (
                  <ChevronRight className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
