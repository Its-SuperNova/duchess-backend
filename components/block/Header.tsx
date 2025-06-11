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
}

const Header: FC<HeaderProps> = ({ title }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  // Only show header on home page for mobile
  if (pathname !== "/") {
    return null;
  }

  const isAuthenticated = status === "authenticated" && session?.user;

  return (
    <header className="lg:hidden w-full mb-2 py-4 px-4 flex items-center justify-between dark:bg-gray-900">
      {/* Logo on the left */}
      <div className="flex items-center">
        <Link href="/">
          <img src="/duchess-logo.png" alt="Duchess Pastries" className="h-8" />
        </Link>
      </div>

      {/* Right side - Sign Up button or Profile image */}
      <div className="relative">
        {!isAuthenticated ? (
          // Show Sign Up button if not authenticated
          <Link href="/register">
            <Button className="h-8 px-4 text-sm bg-primary hover:bg-primary/90">
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
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
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
    </header>
  );
};

export default Header;
