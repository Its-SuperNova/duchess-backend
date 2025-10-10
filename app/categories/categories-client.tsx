"use client";

import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface CategoriesClientProps {
  categories: Category[];
}

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 ">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No categories available
        </h3>
        <p className="text-gray-600">
          We're working on adding more categories. Please check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 min-[540px]:grid-cols-4 min-[680px]:grid-cols-5 min-[798px]:grid-cols-6  min-[1024px]:grid-cols-7 min-[1160px]:grid-cols-8 gap-6">
      {categories.map((category) => (
        <Link
          href={`/products/categories/${category.slug}`}
          key={category.id}
          className="group"
        >
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-24 h-24 lg:w-34 lg:h-34 relative bg-[#F9F5F0] rounded-2xl shadow-sm overflow-hidden flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow duration-300">
              <Image
                src={category.image}
                alt={category.name}
                width={100}
                height={100}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="text-sm font-medium text-center text-gray-800 group-hover:text-primary transition-colors duration-200">
              {category.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
