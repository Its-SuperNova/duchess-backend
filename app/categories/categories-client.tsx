"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface Category {
  name: string;
  image: string;
}

interface CategoriesClientProps {
  categories: Category[];
}

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Page Header */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
            Categories
          </h1>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <Link
              href={`/products?category=${category.name.toLowerCase()}`}
              key={index}
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 relative bg-[#F9F5F0] rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 rounded-[24px] overflow-hidden">
                    <Image
                      src={
                        category.image ||
                        `/placeholder.svg?height=80&width=80&text=${category.name}`
                      }
                      alt={category.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full rounded-[24px]"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium mt-2 text-center">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
