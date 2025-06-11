"use client";

import type { FC } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";

interface HeaderProps {
  title?: string;
  isCollapsed?: boolean;
}

const Header: FC<HeaderProps> = ({ title, isCollapsed }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const isAuthenticated = status === "authenticated" && session?.user;

  // Sidebar margin for desktop
  const sidebarMargin =
    typeof isCollapsed === "boolean"
      ? isCollapsed
        ? "lg:ml-16"
        : "lg:ml-64"
      : "";

  // Show icons only if not on home page
  const showIcons = pathname !== "/";

  return (
    <header
      className={`w-full h-16 min-h-16 max-h-16 py-0 px-4 flex items-center justify-between dark:bg-gray-900 ${sidebarMargin}`}
      style={{ height: 64 }}
    >
      {/* Logo on the left */}
      <div className="flex items-center h-full">
        <Link href="/">
          <img src="/duchess-logo.png" alt="Duchess Pastries" className="h-8" />
        </Link>
      </div>

      {/* Right section: Search, Favorites, Cart, Profile (not on home page) */}
      {showIcons && (
        <div className="flex items-center gap-x-4 h-full pr-2">
          {/* Search Bar */}
          <form action="/search" className="hidden md:flex flex-1 max-w-xs">
            <input
              type="text"
              name="q"
              placeholder="Search..."
              className="w-full rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ height: 40 }}
            />
          </form>
          {/* Favorites Icon */}
          <Link
            href="/favorites"
            className="relative flex items-center justify-center"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-heart text-gray-700 hover:text-primary"
            >
              <path d="M19.5 13.572 12 21l-7.5-7.428A5.5 5.5 0 0 1 12 6.5a5.5 5.5 0 0 1 7.5 7.072Z" />
            </svg>
          </Link>
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shopping-cart text-gray-700 hover:text-primary"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </Link>
          {/* Profile image and dropdown */}
          <div className="relative flex items-center justify-center">
            {!isAuthenticated ? (
              <Link href="/register">
                <Button className="h-8 px-4 text-sm bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1 hover:opacity-80 transition-opacity focus:outline-none"
                  style={{ paddingRight: 0 }}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <Image
                      src={session?.user?.image || "/profile-avatar.png"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
