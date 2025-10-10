import { Suspense } from "react";
import { getCategories } from "@/lib/actions/categories";
import { getThumbnailUrl } from "@/lib/cloudinary-client";
import CategoriesClient from "./categories-client";
import { createCategorySlug } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export const metadata = {
  title: "All Categories - Duchess Pastries",
  description:
    "Browse all our delicious pastry categories including cakes, cookies, breads, and more.",
};

export default async function CategoriesPage() {
  // Fetch categories from database
  let categories: Category[] = [];
  let errorMessage: string | null = null;

  try {
    console.log("Fetching categories from database...");
    const dbCategories = await getCategories();
    console.log("Database categories received:", dbCategories);

    if (dbCategories && dbCategories.length > 0) {
      // Filter only active categories and transform the data structure
      categories = dbCategories
        .filter((category: any) => (category as any).is_active)
        .map((category: any) => ({
          id: (category as any).id,
          name: (category as any).name,
          image: (category as any).image
            ? getThumbnailUrl((category as any).image, 300)
            : "/images/categories/sweets-bowl.png", // fallback image
          slug: createCategorySlug((category as any).name),
        }));

      console.log("Processed categories:", categories);
    } else {
      console.log("No categories found in database");
      errorMessage = "No categories found in database";
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    errorMessage = `Database error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }

  // Only use fallback if we have no categories and there was an error
  if (categories.length === 0 && errorMessage) {
    console.log("Using fallback categories due to error:", errorMessage);
    categories = [
      {
        id: "1",
        name: "Cup Cake",
        image: "/images/categories/cupcake.png",
        slug: "cup-cake",
      },
      {
        id: "2",
        name: "Cookies",
        image: "/images/categories/cookies.png",
        slug: "cookies",
      },
      {
        id: "3",
        name: "Donuts",
        image: "/images/categories/pink-donut.png",
        slug: "donuts",
      },
      {
        id: "4",
        name: "Breads",
        image: "/images/categories/bread.png",
        slug: "breads",
      },
      {
        id: "5",
        name: "Pastry",
        image: "/images/categories/croissant.png",
        slug: "pastry",
      },
      {
        id: "6",
        name: "Sweets",
        image: "/images/categories/sweets-bowl.png",
        slug: "sweets",
      },
      {
        id: "7",
        name: "Chocolate",
        image: "/images/categories/chocolate-bar.png",
        slug: "chocolate",
      },
      {
        id: "8",
        name: "Muffins",
        image: "/images/categories/muffin.png",
        slug: "muffins",
      },
      {
        id: "9",
        name: "Cake",
        image: "/images/categories/cake.png",
        slug: "cake",
      },
      {
        id: "10",
        name: "Brownies",
        image: "/images/categories/brownie.png",
        slug: "brownies",
      },
    ];
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8 md:ml-5">
          <h1 className="text-3xl font-bold mb-2">All Categories</h1>
          <p className="text-gray-600">
            Explore our delicious range of pastries and baked goods
          </p>
          {errorMessage && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> {errorMessage}. Showing fallback
                categories.
              </p>
            </div>
          )}
        </div>

        <div className="w-full">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesClient categories={categories} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-3 min-[540px]:grid-cols-4 min-[680px]:grid-cols-5 min-[798px]:grid-cols-6 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-24 h-24 lg:w-40 lg:h-40 bg-gray-200 rounded-2xl animate-pulse mb-3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      ))}
    </div>
  );
}
