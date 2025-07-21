"use client";

import { ProcessedProduct } from "@/lib/utils";
import ProductCard from "@/components/productcard";
import Hero from "@/components/block/hero";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/context/layout-context";
import { useMemo } from "react";

interface HomeClientProps {
  initialProducts: ProcessedProduct[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const getLayoutClasses = (() => {
    try {
      return useLayout().getLayoutClasses;
    } catch {
      return () => ({
        isCompact: false,
        isVeryCompact: false,
        mainContentClasses: "",
      });
    }
  })();

  const { isCompact, isVeryCompact } = getLayoutClasses();

  const homePadding = useMemo(() => {
    return isVeryCompact ? "px-2" : isCompact ? "px-4" : "";
  }, [isVeryCompact, isCompact]);

  return (
    <div
      className={`w-full overflow-x-hidden bg-white dark:bg-gray-900 ${homePadding}`}
    >
      {/* Hero Section */}
      <div className="w-full">
        <Hero />
      </div>

      {/* Products Section */}
      <div className="w-full">
        <section className="px-4 py-8 pt-0 md:pt-8 md:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
          </div>

          {initialProducts.length === 0 ? (
            <p>No products available</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {initialProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    rating={product.rating}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    isVeg={product.isVeg}
                    description={product.description}
                    category={product.category}
                    hasOffer={product.hasOffer}
                    offerPercentage={product.offerPercentage}
                    priority={index < 4}
                  />
                ))}
              </div>
              <div className="w-full flex justify-center mt-6">
                <Link href="/products">
                  <Button variant="outline" className="px-6">
                    View all products
                  </Button>
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Why We Are Best Banner - Mobile */}
        <div className="block lg:hidden px-4 md:px-6 py-6 md:py-8 mb-20 w-full">
          <div className="rounded-3xl overflow-hidden shadow-md w-full">
            <Image
              src="/images/duchess-pastries-banner-mobile.png"
              alt="Why we are the best"
              width={800}
              height={200}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Why We Are Best Banner - Desktop */}
        <div className="hidden lg:block px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full">
          <div className="rounded-3xl overflow-hidden shadow-md w-full">
            <Image
              src="/images/duchess-pastries-banner-desktop.png"
              alt="Why we are the best"
              width={1280}
              height={320}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
