"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RiHomeSmile2Fill } from "react-icons/ri";
import { HiSquares2X2 } from "react-icons/hi2";
import { PiHeartFill } from "react-icons/pi";
import { HiUser } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(pathname);

  // Update active tab when pathname changes
  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  // Hide bottom nav on login, register, and admin pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const isAuthenticated = status === "authenticated" && session?.user;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: RiHomeSmile2Fill,
      isReactIcon: true,
      isCartButton: false,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: HiSquares2X2,
      isReactIcon: true,
      isCartButton: false,
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: PiHeartFill,
      isReactIcon: true,
      isCartButton: false,
    },
    {
      name: isAuthenticated ? "Profile" : "Sign Up",
      href: isAuthenticated ? "/profile" : "/register",
      icon: isAuthenticated ? HiUser : UserPlus,
      isReactIcon: isAuthenticated ? true : false,
      isCartButton: false,
    },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] md:hidden bottom-nav">
      {/* Animated floating container */}
      <div
        className="bg-white backdrop-blur-md rounded-full shadow-md p-2 transition-all duration-300 ease-in-out border border-gray-100"
        style={{
          boxShadow:
            "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Navigation items */}
        <nav className="relative">
          <ul className="flex items-center justify-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;

              return (
                <li key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className={`flex flex-row items-center justify-center h-12 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${
                      isActive
                        ? "bg-[#7A0000] text-white shadow-md"
                        : "text-black hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab(item.href)}
                  >
                    {item.isReactIcon ? (
                      <IconComponent
                        size={20}
                        className={`transition-colors duration-200 ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      />
                    ) : (
                      <IconComponent
                        className={`w-[18px] h-[18px] transition-colors duration-200 ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      />
                    )}
                    {isActive && (
                      <span
                        className="text-white ml-2 text-md font-medium whitespace-nowrap animate-fade-in"
                        style={{
                          animation: "fadeIn 200ms ease-in-out",
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
