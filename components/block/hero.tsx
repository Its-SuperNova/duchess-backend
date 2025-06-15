"use client";
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import {
  Bell,
  ShoppingCart,
  ChevronDown,
  Shield,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LogoutButton from "@/components/auth/logout-button";
import { isUserAdmin } from "@/lib/auth-utils";
import { getCategories } from "@/lib/actions/categories";
import { toast } from "sonner";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

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
      {/* Desktop Header - Only visible on lg screens and up */}
      <div className="hidden lg:flex bg-white border-b border-gray-200 h-16 items-center justify-end px-6 gap-4">
        {/* Small Search Bar */}
        <div className="relative w-80">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 text-sm"
          />
        </div>

        {/* Notification Icon */}
        <Link
          href="/notifications"
          className="relative hover:opacity-80 transition-opacity"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
            3
          </span>
        </Link>

        {/* Cart Icon */}
        <Link
          href="/cart"
          className="relative hover:opacity-80 transition-opacity"
        >
          <ShoppingCart className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
            2
          </span>
        </Link>

        {/* Admin Button */}
        {isAdmin && (
          <Link href="/admin">
            <Button variant="outline" size="sm" className="h-9">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        )}

        {/* Right side - Sign Up button or Profile image */}
        <div className="relative">
          {!isAuthenticated ? (
            // Show Sign Up button if not authenticated
            <Link href="/register">
              <Button className="h-10 px-6 text-sm bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          ) : (
            // Show profile image with dropdown if authenticated
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
              >
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={session?.user?.image || "/profile-avatar.png"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 min-w-48 max-w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 break-words">
                        {session?.user?.email}
                      </p>
                    </div>
                    <div className="px-2 py-1">
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Desktop Single Card - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full mt-6 mb-8 px-4 max-w-full">
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-full h-48 rounded-2xl flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Sweet Delights</h2>
            <p className="text-lg opacity-90">
              Discover our premium collection
            </p>
          </div>
        </div>
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
            {/* 1536px and up: Show skeleton loaders */}
            <div className="hidden 2xl:grid grid-cols-12 gap-6">
              <CategorySkeleton count={12} />
            </div>
            {/* 1285px to 1535px: Show skeleton loaders */}
            <div className="hidden xl:grid 2xl:hidden grid-cols-10 gap-6">
              <CategorySkeleton count={10} />
            </div>
            {/* 800px to 1284px: Show skeleton loaders */}
            <div className="hidden lg:grid xl:hidden grid-cols-8 gap-6">
              <CategorySkeleton count={8} />
            </div>
          </>
        ) : categoriesError ? (
          <CategoriesError />
        ) : categories.length === 0 ? (
          <CategoriesEmpty />
        ) : (
          <>
            {/* 1536px and up: Show all categories */}
            <div className="hidden 2xl:grid grid-cols-12 gap-6">
              {categories.slice(0, 12).map((category) => (
                <Link
                  href={`/products?category=${category.name.toLowerCase()}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center group cursor-pointer">
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

            {/* 1285px to 1535px: Show all categories */}
            <div className="hidden xl:grid 2xl:hidden grid-cols-10 gap-6">
              {categories.slice(0, 10).map((category) => (
                <Link
                  href={`/products?category=${category.name.toLowerCase()}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center group cursor-pointer">
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

            {/* 800px to 1284px: Show all categories */}
            <div className="hidden lg:grid xl:hidden grid-cols-8 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  href={`/products?category=${category.name.toLowerCase()}`}
                  key={category.id}
                >
                  <div className="flex flex-col items-center group cursor-pointer">
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
      <div className="lg:hidden w-full px-3 flex flex-col gap-4 pb-[50px] overflow-x-hidden">
        {/* Search Bar & Filter */}
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="relative flex-1 min-w-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#523435] text-xl" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 rounded-[20px] focus:outline-none focus:ring-1 focus:ring-black border border-gray-200"
            />
          </div>
          <div className="bg-white h-[41px] w-[48px] rounded-lg flex justify-center items-center border border-gray-200 flex-shrink-0">
            <IoFilter className="text-[#523435]" />
          </div>
        </div>

        {/* Pink Container for Mobile */}
        <div className="w-full h-[200px] mb-4 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-full h-full rounded-2xl flex items-center justify-center text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Sweet Delights</h2>
              <p className="text-base opacity-90">
                Discover our premium collection
              </p>
            </div>
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
                    href={`/products?category=${category.name.toLowerCase()}`}
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
                    href={`/products?category=${category.name.toLowerCase()}`}
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
                    href={`/products?category=${category.name.toLowerCase()}`}
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
