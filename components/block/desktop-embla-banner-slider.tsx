"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

const bannerImages = [
  {
    id: 1,
    src: "/banners/1.png",
    alt: "Delicious cakes and pastries",
  },
  {
    id: 2,
    src: "/banners/2.png",
    alt: "Fresh baked cookies",
  },
  {
    id: 3,
    src: "/banners/3.png",
    alt: "Beautiful cupcakes",
  },
];

const bannerImagesMobile = [
  {
    id: 1,
    src: "/banners/mobile/1.png",
    alt: "Delicious cakes and pastries",
  },
  {
    id: 2,
    src: "/banners/mobile/2.png",
    alt: "Fresh baked cookies",
  },
  {
    id: 3,
    src: "/banners/mobile/3.png",
    alt: "Beautiful cupcakes",
  },
];

interface DesktopEmblaSliderProps {
  className?: string;
}

const DesktopEmblaSlider: React.FC<DesktopEmblaSliderProps> = ({
  className = "",
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
    inViewThreshold: 0.7,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer for visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the slider is visible
        rootMargin: "50px", // Start observing 50px before entering viewport
      }
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => {
      if (sliderRef.current) {
        observer.unobserve(sliderRef.current);
      }
    };
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  // Auto-play functionality with visibility control
  useEffect(() => {
    if (!emblaApi || !isVisible) {
      // Clear interval when not visible or no API
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
      return;
    }

    // Start autoplay when visible
    autoplayIntervalRef.current = setInterval(() => {
      if (emblaApi && isVisible) {
        emblaApi.scrollNext();
      }
    }, 5000); // Change slide every 5 seconds

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [emblaApi, isVisible]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      ref={sliderRef}
      className={`relative w-full rounded-[28px] ${className}`}
    >
      {/* Desktop Banner Slider - Full height on lg+ screens */}
      <div className="hidden lg:block">
        <div
          className="h-[300px] overflow-hidden rounded-[28px]"
          ref={emblaRef}
        >
          <div className="flex h-full">
            {bannerImages.map((banner, index) => (
              <div
                key={`desktop-${banner.id}`}
                className="flex-[0_0_100%] min-w-0 relative rounded-[28px] mr-4 last:mr-0 h-full"
              >
                <div className="relative w-full h-full rounded-[28px]">
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    className="object-cover rounded-[28px]"
                    priority={index === 0} // Only first image gets priority
                    loading={index === 0 ? "eager" : "lazy"} // Lazy load non-first images
                    sizes="(max-width: 1280px) 100vw, 1280px" // Optimized for hero usage
                    quality={85} // Slightly reduced quality for better performance
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                  <div className="absolute inset-0 bg-black/10 rounded-[28px]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Banner Slider - Responsive height */}
      <div className="block lg:hidden">
        <div
          className="w-full aspect-[450/220] overflow-hidden rounded-[20px] md:rounded-[24px]"
          ref={emblaRef}
        >
          <div className="flex h-full">
            {bannerImagesMobile.map((banner, index) => (
              <div
                key={`mobile-${banner.id}`}
                className="flex-[0_0_100%] min-w-0 relative rounded-[20px] md:rounded-[24px] mr-3 md:mr-4 last:mr-0 h-full"
              >
                <div className="relative w-full h-full rounded-[20px] md:rounded-[24px]">
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    className="object-cover rounded-[20px] md:rounded-[24px]"
                    priority={index === 0} // Only first image gets priority
                    loading={index === 0 ? "eager" : "lazy"} // Lazy load non-first images
                    sizes="100vw" // Full viewport width for mobile
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                  <div className="absolute inset-0 bg-black/10 rounded-[20px] md:rounded-[24px]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots Indicator - Responsive positioning and sizing */}
      <div className="absolute bottom-3 lg:bottom-6 left-1/2 -translate-x-1/2 flex space-x-1.5 md:space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-white scale-110 md:scale-125 shadow-lg"
                : "bg-white/60 hover:bg-white/80"
            }`}
            style={{
              width: index === selectedIndex ? "8px" : "6px",
              height: index === selectedIndex ? "8px" : "6px",
            }}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopEmblaSlider;
