"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { Bell, ShoppingCart, ChevronDown, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/logout-button";
import { useTheme } from "@/context/theme-context";
import { isUserAdmin } from "@/lib/auth-utils";
import { useCart } from "@/context/cart-context";
import { useLayout } from "@/context/layout-context";
import { getDefaultAddress } from "@/lib/address-utils";
import { getUserByEmail } from "@/lib/auth-utils";
import type { Address } from "@/lib/supabase";
import { HiMapPin } from "react-icons/hi2";
import { MdShoppingCart } from "react-icons/md";
const DesktopHeader = () => {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const isAuthenticated = status === "authenticated" && session?.user;
  const { openCart, cart, isCartOpen } = useCart();

  // Try to get layout context, with fallback
  let getLayoutClasses = () => ({
    isCompact: false,
    isVeryCompact: false,
    mainContentClasses: "flex-1 transition-all duration-300",
  });
  let isCartSidebarOpen = false;
  try {
    const layoutContext = useLayout();
    getLayoutClasses = layoutContext.getLayoutClasses;
    isCartSidebarOpen = layoutContext.isCartSidebarOpen;
  } catch (error) {
    // Layout context not available, use default values
  }

  // Get layout state for header positioning and responsiveness
  let isUserSidebarCollapsed = true;
  try {
    const layoutContext = useLayout();
    isUserSidebarCollapsed = layoutContext.isUserSidebarCollapsed;
  } catch (error) {
    // Layout context not available, use default values
  }

  // Get layout classes to determine available space
  const { isCompact, isVeryCompact } = getLayoutClasses();

  // Calculate header positioning based on sidebar states
  const leftPosition = isUserSidebarCollapsed ? "lg:left-16" : "lg:left-64";
  const rightPosition = isCartOpen ? "lg:right-96" : "lg:right-0";
  const headerPositionClasses = `${leftPosition} ${rightPosition} lg:transition-all lg:duration-300`;

  // Responsive classes based on available space
  const getResponsiveClasses = () => {
    if (isVeryCompact) {
      return {
        addressMaxWidth: "max-w-[3rem]", // Very narrow address
        hideNotifications: true, // Hide notification icon
        itemGap: "gap-2", // Smaller gap between items
        hideSearchBar: "hidden", // Hide search bar below 1100px
      };
    } else if (isCompact) {
      return {
        addressMaxWidth: "max-w-[12rem]", // Medium address width
        hideNotifications: false,
        itemGap: "gap-3", // Medium gap between items
        hideSearchBar: "hidden", // Hide search bar below 1100px
      };
    } else {
      return {
        addressMaxWidth: "max-w-xs", // Full address width
        hideNotifications: false,
        itemGap: "gap-4", // Full gap between items
        hideSearchBar: "", // Show search bar
      };
    }
  };

  const responsiveClasses = getResponsiveClasses();

  // Additional responsive logic for search bar
  const getSearchBarClasses = () => {
    let classes = responsiveClasses.hideSearchBar;

    // Hide below 1100px unconditionally
    classes += " max-[1100px]:hidden";

    // Hide below 1300px when user sidebar is expanded
    if (!isUserSidebarCollapsed) {
      classes += " max-[1300px]:hidden";
    }

    return classes;
  };

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

  // Fetch user's default address
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (isAuthenticated && session?.user?.email) {
        try {
          const user = await getUserByEmail(session.user.email);
          if (user) {
            const address = await getDefaultAddress(user.id);
            setDefaultAddress(address);
          }
        } catch (error) {
          console.error("Error fetching default address:", error);
        }
      } else {
        setDefaultAddress(null);
      }
    };
    fetchDefaultAddress();
  }, [isAuthenticated, session]);

  // Try to get theme context, with fallback
  let theme = "light";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    // Theme context not available, use default light theme
    theme = "light";
  }

  // Format address for display
  const formatAddressForDisplay = (address: Address) => {
    return `${address.address_name} - ${address.full_address}`;
  };

  return (
    <div
      className={`flex lg:fixed lg:top-0 z-50 bg-[#F4F4F7] lg:bg-white dark:bg-[#202028] lg:border-b lg:border-gray-200 lg:dark:border-gray-700 h-16 items-center justify-between px-4 lg:px-6 ${headerPositionClasses}`}
    >
      {/* Left side - User Address */}
      <div
        className={`flex items-center max-w-[40%] lg:max-w-none ${
          isCartOpen ? "hidden" : ""
        }`}
      >
        {isAuthenticated && defaultAddress && (
          <Link
            href="/profile/addresses"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full"
          >
            <div className="flex items-center justify-center p-2.5 bg-[#E8EAED] lg:bg-gray-100 dark:bg-gray-800 rounded-full">
              <HiMapPin className="h-5 w-5 text-[#7A0000]" />
            </div>
            <div className="w-full">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {defaultAddress.address_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {defaultAddress.full_address}
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Mobile Right side - Cart and Profile */}
      <div className="flex lg:hidden items-center gap-3">
        {/* Cart Icon for Mobile */}
        <button
          onClick={openCart}
          className="relative hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center p-2.5 bg-[#E8EAED] lg:bg-gray-100 dark:bg-gray-800 rounded-full">
            <MdShoppingCart className="h-5 w-5 text-black dark:text-white" />
          </div>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        {!isAuthenticated ? (
          // Show Sign Up button if not authenticated
          <Link href="/register">
            <Button className="h-9 px-4 text-sm bg-primary hover:bg-primary/90">
              Sign Up
            </Button>
          </Link>
        ) : (
          // Show profile image with dropdown if authenticated
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden">
                <Image
                  src={session?.user?.image || "/profile-avatar.png"}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Mobile Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 min-w-48 max-w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
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

      {/* Desktop Right side - Full header components */}
      <div
        className={`hidden lg:flex items-center ${responsiveClasses.itemGap}`}
      >
        {/* Small Search Bar */}
        <div className={`relative w-80 ${getSearchBarClasses()}`}>
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-[#18171C] text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Notification Icon */}
        {!responsiveClasses.hideNotifications && (
          <Link
            href="/notifications"
            className="relative hover:opacity-80 transition-opacity"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
              3
            </span>
          </Link>
        )}

        {/* Cart Icon */}
        <button
          onClick={openCart}
          className="relative hover:opacity-80 transition-opacity"
        >
          <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        {/* Admin Button */}
        {isAdmin && (
          <Link href="/admin">
            <Button variant="outline" size="sm" className="h-9">
              <Shield className={`h-4 w-4 ${isVeryCompact ? "" : "mr-2"}`} />
              {!isVeryCompact && "Admin"}
            </Button>
          </Link>
        )}

        {/* Desktop Profile */}
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
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Desktop Dropdown menu */}
              {showDropdown && (
                <div
                  className={`absolute ${
                    isVeryCompact
                      ? "right-0 top-full -translate-x-0"
                      : "right-0 top-full"
                  } mt-2 ${
                    isVeryCompact ? "min-w-40 max-w-48" : "min-w-48 max-w-64"
                  } bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50`}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
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
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default DesktopHeader;
