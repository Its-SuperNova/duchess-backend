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


    </div>
  );
}
