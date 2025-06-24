"use client";
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { Shield, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { isUserAdmin } from "@/lib/auth-utils";
import { getCategories } from "@/lib/actions/categories";
import { toast } from "sonner";
import { useLayout } from "@/context/layout-context";
import BannerSlider from "./banner-slider";
interface Category {
  id: string;
  name: string;
  image: string | null;
  description?: string;
  is_active: boolean;
}

// Mobile slider images (keeping existing ones)
const mobileSlides = [
  {
    id: 1,
    image: "/images/image1.png",
    alt: "Delicious pastries and cakes",
  },
  {
    id: 2,
    image: "/images/image2.png",
    alt: "Fresh baked goods",
  },
  {
    id: 3,
    image: "/images/image3.png",
    alt: "Sweet treats and desserts",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Get category grid configuration
  const { columns, maxCategories, gridClasses } = getCategoryGridConfig();

  // Auto-slide functionality for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mobileSlides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoriesError(null);

        const fetchedCategories = await getCategories();

        // Filter only active categories
        const activeCategories = fetchedCategories.filter(
          (category: Category) => category.is_active
        );

        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoriesError("Failed to load categories");
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const retryFetchCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);

    try {
      const fetchedCategories = await getCategories();
      const activeCategories = fetchedCategories.filter(
        (category: Category) => category.is_active
      );
      setCategories(activeCategories);
      toast.success("Categories loaded successfully");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Failed to load categories");
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

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
        <div key={index} className="flex flex-col items-center">
          <Skeleton className="w-16 h-16 lg:w-20 lg:h-20 rounded-[20px] lg:rounded-[24px]" />
          <Skeleton className="w-12 h-4 mt-2 lg:mt-3" />
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

  // Function to get fallback image for categories
  const getCategoryImage = (category: Category) => {
    if (category.image) {
      return category.image;
    }

    // Map category names to default images
    const categoryImageMap: { [key: string]: string } = {
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
    };

    const categoryKey = category.name.toLowerCase();
    return (
      categoryImageMap[categoryKey] || "/images/categories/sweets-bowl.png"
    );
  };

  return (
    <div className="w-full">
      {/* Desktop Pink Banner - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full mt-6 mb-8 px-4 max-w-full">
        <div className="w-full h-[250px] bg-gradient-to-br from-pink-400 to-pink-600 rounded-[28px]" />
      </div>

      {/* Desktop Categories - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full px-4 mb-8">
        <div className="flex w-full justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <Link
            href="/categories"
            className="font-medium text-[#d48926de] hover:underline"
          >
            See All
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
            <div className={gridClasses}>
              {categories.slice(0, maxCategories).map((category) => (
                <Link
                  href={`/products?category=${category.id}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-24">
                    <div className="w-20 h-20 relative bg-[#F9F5F0] rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                      <Image
                        src={getCategoryImage(category)}
                        alt={category.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-sm font-medium mt-3 text-center group-hover:text-[#d48926de] transition-colors">
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
      <div className="lg:hidden w-full px-3 flex flex-col gap-4 pb-[30px] overflow-x-hidden">
        {/* Banner Slider for Mobile */}
        <div className="w-full max-w-md mx-auto mb-2">
          <BannerSlider />
        </div>

        {/* Search Bar & Filter */}
        <div className="flex items-center w-full">
          <div className="relative flex-1 min-w-0">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-l-full focus:outline-none focus:ring-2 focus:ring-gray-200 border-0 shadow-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="bg-white h-12 flex items-center w-[2px]">
            <div className="w-[2px] h-4 rounded-full bg-gray-200"></div>
          </div>
          <div className="bg-white h-12 w-12 rounded-r-full flex justify-center items-center shadow-sm flex-shrink-0">
            <IoFilter className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex w-full justify-between items-center px-1">
          <h2 className="text-lg md:text-xl font-medium">Categories</h2>
          <div>
            <Link href="/categories" className="font-medium text-primary">
              See All
            </Link>
          </div>
        </div>

        {/* Categories Grid - Responsive based on specific breakpoints */}
        <div className="w-full mt-2 overflow-x-auto">
          {isLoadingCategories ? (
            <div className="flex flex-nowrap gap-4 min-w-full">
              <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-7 gap-4 w-full">
                <CategorySkeleton count={7} />
              </div>
            </div>
          ) : categoriesError ? (
            <CategoriesError />
          ) : categories.length === 0 ? (
            <CategoriesEmpty />
          ) : (
            <div className="flex flex-nowrap gap-4 min-w-full">
              {/* Show all categories between 800px-1023px */}
              <div className="hidden sm:grid sm:grid-cols-7 md:hidden gap-4 w-full">
                {categories.slice(0, 7).map((category) => (
                  <Link
                    href={`/products?category=${category.id}`}
                    key={category.id}
                  >
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 relative bg-[#F9F5F0] rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <Image
                          src={getCategoryImage(category)}
                          alt={category.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm mt-2 text-center group-hover:text-[#d48926de] transition-colors line-clamp-2">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Show all categories between 520px-799px */}
              <div className="hidden xs:grid xs:grid-cols-5 sm:hidden gap-4 w-full">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    href={`/products?category=${category.id}`}
                    key={category.id}
                  >
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 relative bg-[#F9F5F0] rounded-[24px] shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <Image
                          src={getCategoryImage(category)}
                          alt={category.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm mt-2 text-center group-hover:text-[#d48926de] transition-colors line-clamp-2">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Show all categories below 520px */}
              <div className="grid grid-cols-4 xs:hidden gap-4 w-full">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    href={`/products?category=${category.id}`}
                    key={category.id}
                  >
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 relative bg-[#F9F5F0] rounded-[20px] shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <Image
                          src={getCategoryImage(category)}
                          alt={category.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm mt-2 text-center group-hover:text-[#d48926de] transition-colors line-clamp-2">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
