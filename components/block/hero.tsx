"use client";
import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Shield, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

import { isUserAdmin } from "@/lib/auth-utils";
import { useCategories } from "@/hooks/use-categories";
import { toast } from "sonner";
import DynamicBannerSlider from "@/components/block/dynamic-banner-slider";
interface Category {
  id: string;
  name: string;
  image: string | null;
}

const Hero = memo(() => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  // Use cached categories data
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refresh: refreshCategories,
  } = useCategories();

  // Dynamic category grid configuration based on screen width
  const [maxCategories, setMaxCategories] = useState(10);
  const [columns, setColumns] = useState(10);
  const [mobileCategories, setMobileCategories] = useState(4);

  useEffect(() => {
    const updateCategoryCount = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        // Desktop large
        setMaxCategories(10);
        setColumns(10);
      } else if (width >= 1075) {
        // Desktop medium
        setMaxCategories(9);
        setColumns(9);
      } else if (width >= 1024) {
        // Desktop small
        setMaxCategories(8);
        setColumns(8);
      } else if (width >= 768) {
        // Tablet large
        setMaxCategories(7);
        setColumns(7);
      } else if (width >= 640) {
        // Tablet small
        setMaxCategories(6);
        setColumns(6);
      } else if (width >= 480) {
        // Mobile large
        setMaxCategories(5);
        setColumns(5);
      } else {
        // Mobile small
        setMaxCategories(4);
        setColumns(4);
      }

      // Update mobile categories for mobile section
      if (width >= 600 && width <= 700) {
        setMobileCategories(7);
      } else if (width >= 500) {
        setMobileCategories(6);
      } else if (width >= 420) {
        setMobileCategories(5);
      } else {
        setMobileCategories(4);
      }
    };

    // Set initial value
    updateCategoryCount();

    // Add resize listener
    window.addEventListener("resize", updateCategoryCount);

    // Cleanup
    return () => window.removeEventListener("resize", updateCategoryCount);
  }, []);

  const gridClasses = "hidden sm:flex flex-nowrap gap-6 justify-start";

  // Function to create a URL-friendly slug from category name
  const createCategorySlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[&]/g, "and") // Replace & with "and"
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();
  };

  const retryFetchCategories = useCallback(async () => {
    try {
      await refreshCategories();
      toast.success("Categories loaded successfully");
    } catch (error) {
      console.error("Error refreshing categories:", error);
      toast.error("Failed to load categories");
    }
  }, [refreshCategories]);

  const isAuthenticated = status === "authenticated" && session?.user;

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && session?.user?.email) {
        const adminStatus = await isUserAdmin(session.user.email);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [isAuthenticated, session]);

  // Category skeleton loader component
  const CategorySkeleton = ({ count }: { count: number }) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col items-center flex-shrink-0">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-200 animate-pulse rounded-[20px] lg:rounded-[24px]" />
          <div className="w-12 h-4 bg-gray-200 animate-pulse rounded mt-2 lg:mt-3" />
        </div>
      ))}
    </>
  );

  // Categories error component
  const CategoriesError = () => (
    <div className="flex flex-col items-center justify-center py-8 lg:py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load categories
        </h3>
        <p className="text-gray-600 mb-4">
          We couldn't load the categories. Please try again.
        </p>
        <Button
          onClick={retryFetchCategories}
          variant="outline"
          className="mx-auto"
          disabled={isLoadingCategories}
        >
          {isLoadingCategories ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Try Again
        </Button>
      </div>
    </div>
  );

  // Categories empty state component
  const CategoriesEmpty = () => (
    <div className="flex flex-col items-center justify-center py-8 lg:py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No categories available
        </h3>
        <p className="text-gray-600 mb-4">
          Categories will appear here once they are added to the system.
        </p>
        {isAdmin && (
          <Link href="/admin/categories">
            <Button className="mx-auto">
              <Shield className="w-4 h-4 mr-2" />
              Manage Categories
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  // Memoize the category image mapping to prevent recreation on every render
  const categoryImageMap = useMemo(
    () => ({
      cakes: "/images/categories/cake.png",
      cupcakes: "/images/categories/cupcake.png",
      cookies: "/images/categories/cookies.png",
      breads: "/images/categories/bread.png",
      pastries: "/images/categories/croissant.png",
      donuts: "/images/categories/donut.png",
      brownies: "/images/categories/brownie.png",
      tarts: "/images/categories/tart.png",
      macarons: "/images/categories/macaron.png",
      croissants: "/images/categories/croissant.png",
      pies: "/images/categories/pie.png",
      muffins: "/images/categories/muffin.png",
      sweets: "/images/categories/sweets-bowl.png",
      chocolates: "/images/categories/chocolate-bar.png",
    }),
    []
  );

  // Function to get fallback image for categories
  const getCategoryImage = useCallback(
    (category: Category) => {
      if (category.image) {
        return category.image;
      }

      const categoryKey = category.name.toLowerCase();
      return (
        categoryImageMap[categoryKey as keyof typeof categoryImageMap] ||
        "/images/categories/sweets-bowl.png"
      );
    },
    [categoryImageMap]
  );

  return (
    <div className="w-full">
      {/* Desktop/Tablet Banner Slider - Only visible on sm screens and up */}
      <div className="hidden sm:block w-full mt-6 mb-8 px-4 max-w-full">
        <DynamicBannerSlider deviceType="desktop" />
      </div>

      {/* Desktop/Tablet Categories - Only visible on sm screens and up */}
      <div className="hidden sm:block w-full px-4 mb-8">
        <div className="flex w-full justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <Link href="/products">
            <button className="text-sm text-primary hover:text-primary/80 underline transition-colors duration-200 whitespace-nowrap font-medium">
              See All
            </button>
          </Link>
        </div>

        {/* Categories content based on loading/error/empty states */}
        {isLoadingCategories ? (
          <>
            {/* Dynamic grid based on available space */}
            <div className={gridClasses}>
              <CategorySkeleton count={maxCategories} />
            </div>
          </>
        ) : categoriesError ? (
          <CategoriesError />
        ) : categories.length === 0 ? (
          <CategoriesEmpty />
        ) : (
          <>
            {/* Dynamic grid based on available space */}
            <div className="flex items-center gap-6">
              <div className={gridClasses}>
                {categories.slice(0, maxCategories).map((category) => (
                  <Link
                    href={`/products/categories/${createCategorySlug(
                      category.name
                    )}`}
                    key={category.id}
                  >
                    <div className="flex flex-col items-center cursor-pointer flex-shrink-0 w-24 group">
                      <div className="w-20 h-20 relative bg-[#F9F5F0] rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center">
                        <Image
                          src={getCategoryImage(category) || "/placeholder.svg"}
                          alt={category.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <p className="text-sm font-medium mt-3 text-center">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Content - Hidden on sm screens and up */}
      <div className="sm:hidden w-full px-3 flex flex-col gap-4 pb-[30px]">
        {/* Banner Slider for Mobile */}
        <div className="w-full mb-2">
          <DynamicBannerSlider deviceType="mobile" />
        </div>

        {/* Categories */}
        <div className="flex w-full justify-between items-center px-1">
          <h2 className="text-lg md:text-xl font-medium">Categories</h2>
          <Link href="/products">
            <button className="text-sm text-primary hover:text-primary/80 underline transition-colors duration-200">
              See All
            </button>
          </Link>
        </div>

        {/* Categories Grid - 4 categories on small mobile, 5 on larger mobile */}
        <div className="w-full mt-2">
          {isLoadingCategories ? (
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${mobileCategories}, 1fr)`,
              }}
            >
              <CategorySkeleton count={mobileCategories} />
            </div>
          ) : categoriesError ? (
            <CategoriesError />
          ) : categories.length === 0 ? (
            <CategoriesEmpty />
          ) : (
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${mobileCategories}, 1fr)`,
              }}
            >
              {categories.slice(0, mobileCategories).map((category) => (
                <Link
                  href={`/products/categories/${createCategorySlug(
                    category.name
                  )}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className="w-14 h-14 relative bg-[#F9F5F0] rounded-[18px] shadow-sm overflow-hidden flex items-center justify-center">
                      <Image
                        src={getCategoryImage(category) || "/placeholder.svg"}
                        alt={category.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="text-xs mt-1 text-center line-clamp-2">
                      {category.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Hero;
