"use client";

import { ProcessedProduct } from "@/lib/utils";

import Hero from "@/components/block/hero";
interface HomeClientProps {
  initialProducts: ProcessedProduct[];
}

interface ApiResponse {
  success: boolean;
  products: any[];
}



export default function HomeClient({ initialProducts }: HomeClientProps) {


  return (
    <div
      className={`w-full overflow-x-hidden bg-white dark:bg-gray-900 `}
    >
      {/* Hero Section */}
      <div className="w-full">
        <Hero />
      </div>
    </div>
  );
}
