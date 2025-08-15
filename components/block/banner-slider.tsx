"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const bannerImages = [
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

interface BannerSliderProps {
  className?: string;
}

const BannerSlider: React.FC<BannerSliderProps> = ({ className = "" }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
    inViewThreshold: 0.7,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = React.useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = React.useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  React.useEffect(() => {
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

  // Auto-play functionality
  React.useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className={`relative w-full rounded-[28] ${className}`}>
      <div className="overflow-hidden rounded-[28px]" ref={emblaRef}>
        <div className="flex">
          {bannerImages.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0 relative rounded-[28px] mr-4 last:mr-0"
            >
              <div className="relative w-full h-full rounded-[28px]">
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  className="object-cover rounded-[28px]"
                  priority={banner.id === 1}
                  sizes="(max-width: 768px) 100vw, 768px"
                />
                <div className="absolute inset-0 bg-black/10 rounded-[28px]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
