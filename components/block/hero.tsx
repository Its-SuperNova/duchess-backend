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
import { useLayout } from "@/context/layout-context";
import DesktopEmblaSlider from "@/components/block/desktop-embla-banner-slider";
interface Category {
  id: string;
  name: string;
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

  // Try to get layout context, with fallback
  let getCategoryGridConfig = () => ({
    columns: 8,
    maxCategories: 8,
    gridClasses: "hidden lg:flex flex-nowrap gap-6 justify-start",
  });
  try {
    const layoutContext = useLayout();
    getCategoryGridConfig = layoutContext.getCategoryGridConfig;
  } catch (error) {
    // Layout context not available, use default values
  }

  // Get category grid configuration
  const { columns, maxCategories, gridClasses } = getCategoryGridConfig();

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
  // TESTING: No image mapping needed

  // TESTING: No image fetching for categories

  return (
    <div className="w-full">
      {/* Desktop Banner Slider - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full mt-6 mb-8 px-4 max-w-full">
        <DesktopEmblaSlider />
      </div>

      {/* Desktop Categories - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full px-4 mb-8">
        <div className="flex w-full justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Categories</h2>
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
            <div className={gridClasses}>
              {categories.slice(0, maxCategories).map((category) => (
                <Link
                  href={`/products?category=${category.id}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center cursor-pointer flex-shrink-0 w-24 group">
                    <div className="w-20 h-20 relative bg-gray-300 dark:bg-gray-600 rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center">
                      {/* TESTING: Gray background instead of image */}
                      <span className="text-gray-500 dark:text-gray-400 text-xs text-center">
                        No Image
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-3 text-center">
                      {category.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile/Tablet Content - Hidden on lg screens and up */}
      <div className="lg:hidden w-full px-3 flex flex-col gap-4 pb-[30px]">
        {/* Banner Slider for Mobile */}
        <div className="w-full max-w-md mx-auto mb-2">
          <DesktopEmblaSlider />
        </div>

        {/* Categories */}
        <div className="flex w-full justify-between items-center px-1">
          <h2 className="text-lg md:text-xl font-medium">Categories</h2>
        </div>

        {/* Categories Horizontal Scroll - Show all categories */}
        <div className="w-full mt-2">
          {isLoadingCategories ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <CategorySkeleton count={6} />
            </div>
          ) : categoriesError ? (
            <CategoriesError />
          ) : categories.length === 0 ? (
            <CategoriesEmpty />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Link
                  href={`/products?category=${category.id}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center cursor-pointer flex-shrink-0 min-w-[72px] group">
                    <div className="w-16 h-16 relative bg-gray-300 dark:bg-gray-600 rounded-[20px] shadow-sm overflow-hidden flex items-center justify-center">
                      {/* TESTING: Gray background instead of image */}
                      <span className="text-gray-500 dark:text-gray-400 text-xs text-center">
                        No Image
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-center line-clamp-2 max-w-[72px]">
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
