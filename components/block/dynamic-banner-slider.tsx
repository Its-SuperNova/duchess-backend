"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: string;
  src: string;
  alt: string;
  isClickable?: boolean;
  redirectUrl?: string;
}

interface DynamicBannerSliderProps {
  className?: string;
  deviceType: "desktop" | "mobile";
}

const DynamicBannerSlider: React.FC<DynamicBannerSliderProps> = ({
  className = "",
  deviceType,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/banners?deviceType=${deviceType}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setBanners(result.banners);
        } else {
          setError(result.error || "Failed to load banners");
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [deviceType]);

  // Intersection Observer for visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
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
    (index: number) => {
      emblaApi && emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Auto-play functionality with visibility control
  useEffect(() => {
    if (!emblaApi || !isVisible || banners.length <= 1) {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
      return;
    }

    autoplayIntervalRef.current = setInterval(() => {
      if (emblaApi && isVisible) {
        emblaApi.scrollNext();
      }
    }, 5000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [emblaApi, isVisible, banners.length]);

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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div
        ref={sliderRef}
        className={`relative w-full rounded-[28px] ${className}`}
      >
        <div
          className={`${
            deviceType === "desktop"
              ? "w-full aspect-[1200/250] rounded-[28px]"
              : "w-full aspect-[450/220] rounded-[20px] md:rounded-[24px]"
          } bg-gray-200 animate-pulse`}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        ref={sliderRef}
        className={`relative w-full rounded-[28px] ${className}`}
      >
        <div
          className={`${
            deviceType === "desktop"
              ? "w-full aspect-[1200/250] rounded-[28px]"
              : "w-full aspect-[450/220] rounded-[20px] md:rounded-[24px]"
          } bg-gray-100 flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="text-gray-500 text-sm">Failed to load banners</p>
            <p className="text-gray-400 text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (banners.length === 0) {
    return (
      <div
        ref={sliderRef}
        className={`relative w-full rounded-[28px] ${className}`}
      >
        <div
          className={`${
            deviceType === "desktop"
              ? "w-full aspect-[1200/250] rounded-[28px]"
              : "w-full aspect-[450/220] rounded-[20px] md:rounded-[24px]"
          } bg-gray-100 flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="text-gray-500 text-sm">No banners available</p>
            <p className="text-gray-400 text-xs mt-1">
              Banners will appear here once they are added
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderBanner = (banner: Banner, index: number) => {
    const bannerContent = (
      <div className="relative w-full h-full">
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          className={`object-cover ${
            deviceType === "desktop"
              ? "rounded-[28px]"
              : "rounded-[20px] md:rounded-[24px]"
          }`}
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
          sizes={
            deviceType === "desktop"
              ? "(max-width: 1280px) 100vw, 1280px"
              : "100vw"
          }
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div
          className={`absolute inset-0 bg-black/10 ${
            deviceType === "desktop"
              ? "rounded-[28px]"
              : "rounded-[20px] md:rounded-[24px]"
          }`}
        />
      </div>
    );

    if (banner.isClickable && banner.redirectUrl) {
      return (
        <Link
          key={banner.id}
          href={banner.redirectUrl}
          className="block w-full h-full"
        >
          {bannerContent}
        </Link>
      );
    }

    return bannerContent;
  };

  return (
    <div
      ref={sliderRef}
      className={`relative w-full rounded-[28px] ${className}`}
    >
      <div
        className={`${
          deviceType === "desktop"
            ? "w-full aspect-[1200/250] overflow-hidden rounded-[28px]"
            : "w-full aspect-[450/220] overflow-hidden rounded-[20px] md:rounded-[24px]"
        }`}
        ref={emblaRef}
      >
        <div className="flex h-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`flex-[0_0_100%] min-w-0 relative ${
                deviceType === "desktop"
                  ? "rounded-[28px] mr-4 last:mr-0"
                  : "rounded-[20px] md:rounded-[24px] mr-3 md:mr-4 last:mr-0"
              } h-full w-full`}
            >
              {renderBanner(banner, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
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
      )}
    </div>
  );
};

export default DynamicBannerSlider;
