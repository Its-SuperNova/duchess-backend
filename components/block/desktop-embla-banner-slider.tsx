"use client";

import React from "react";
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
    <div className={`relative w-full h-[300px] rounded-[28px] ${className}`}>
      <div className="overflow-hidden rounded-[28px] h-full" ref={emblaRef}>
        <div className="flex h-full">
          {bannerImages.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0 relative rounded-[28px] mr-4 last:mr-0 h-full"
            >
              <div className="relative w-full h-full rounded-[28px]">
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  className="object-cover rounded-[28px]"
                  priority={banner.id === 1}
                  unoptimized={true}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
                <div className="absolute inset-0 bg-black/10 rounded-[28px]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/60 hover:bg-white/80"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopEmblaSlider;
