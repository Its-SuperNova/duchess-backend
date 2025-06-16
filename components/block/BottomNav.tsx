"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Heart, ShoppingBag, User } from "lucide-react"
import { RiHome6Fill } from "react-icons/ri"

export default function BottomNav() {
  const pathname = usePathname()

  // Hide bottom nav on login, register, and admin pages
  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: RiHome6Fill,
      isReactIcon: true,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      isReactIcon: false,
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: Heart,
      isReactIcon: false,
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      isReactIcon: false,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      isReactIcon: false,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 md:hidden bottom-nav">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"></div>

      {/* Navigation items */}
      <nav className="relative h-full max-w-md mx-auto px-4">
        <ul className="flex h-full items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const IconComponent = item.icon

            return (
              <li key={item.name} className="relative flex-1">
                <Link href={item.href} className="flex flex-col items-center justify-center h-full w-full">
                  {item.isReactIcon ? (
                    <IconComponent
                      size={28}
                      className={isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"}
                    />
                  ) : (
                    <IconComponent
                      className={`w-7 h-7 ${isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}
                    />
                  )}
                  <span className={`text-sm mt-1 font-medium ${isActive ? "text-primary" : ""}`}>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
