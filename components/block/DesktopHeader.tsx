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

const DesktopHeader = () => {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isAuthenticated = status === "authenticated" && session?.user;
  const { openCart, cart, isCartOpen } = useCart();

  // Try to get layout context, with fallback
  let getLayoutClasses = () => ({
    isCompact: false,
    isVeryCompact: false,
    mainContentClasses: "flex-1 transition-all duration-300",
  });
  try {
    const layoutContext = useLayout();
    getLayoutClasses = layoutContext.getLayoutClasses;
  } catch (error) {
    // Layout context not available, use default values
  }

  // Get layout state for header positioning
  let isUserSidebarCollapsed = true;
  try {
    const layoutContext = useLayout();
    isUserSidebarCollapsed = layoutContext.isUserSidebarCollapsed;
  } catch (error) {
    // Layout context not available, use default values
  }

  // Calculate header positioning based on sidebar states
  const leftPosition = isUserSidebarCollapsed ? "left-16" : "left-64";
  const rightPosition = isCartOpen ? "right-96" : "right-0";
  const headerPositionClasses = `${leftPosition} ${rightPosition} transition-all duration-300`;

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

  // Try to get theme context, with fallback
  let theme = "light";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    // Theme context not available, use default light theme
    theme = "light";
  }

  return (
    <div
      className={`hidden lg:flex fixed top-0 z-50 bg-white dark:bg-[#202028] border-b border-gray-200 dark:border-gray-700 h-16 items-center justify-end px-6 gap-4 ${headerPositionClasses}`}
    >
      {/* Small Search Bar */}
      <div className="relative w-80">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-[#18171C] text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Notification Icon */}
      <Link
        href="/notifications"
        className="relative hover:opacity-80 transition-opacity"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
          3
        </span>
      </Link>

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
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dropdown menu */}
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
