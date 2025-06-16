"use client"

import { Home, Search, ShoppingCart, Heart, User, Package, Settings, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

interface UserSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export default function UserSidebar({ isCollapsed, setIsCollapsed }: UserSidebarProps) {
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-30 h-full transition-all duration-300 ${
        isCollapsed ? "lg:w-16" : "lg:w-64"
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <>
              <img className="h-8 w-auto" src="/duchess-logo.png" alt="Duchess Pastries" />
            </>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? "mx-auto" : "ml-auto"}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="h-5 w-5 text-gray-600" /> : <X className="h-5 w-5 text-gray-600" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <Link
            href="/"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Home" : ""}
          >
            <Home
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/" ? "text-white" : ""} ${isCollapsed ? "" : "mr-3"}`}
            />
            {!isCollapsed && "Home"}
          </Link>

          <Link
            href="/search"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/search" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Search" : ""}
          >
            <Search
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/search" ? "text-white" : ""} ${
                isCollapsed ? "" : "mr-3"
              }`}
            />
            {!isCollapsed && "Search"}
          </Link>

          <Link
            href="/categories"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/categories" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Categories" : ""}
          >
            <Package
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/categories" ? "text-white" : ""} ${
                isCollapsed ? "" : "mr-3"
              }`}
            />
            {!isCollapsed && "Categories"}
          </Link>

          <Link
            href="/cart"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/cart" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Cart" : ""}
          >
            <ShoppingCart
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/cart" ? "text-white" : ""} ${
                isCollapsed ? "" : "mr-3"
              }`}
            />
            {!isCollapsed && "Cart"}
          </Link>

          <Link
            href="/favorites"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/favorites" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Favorites" : ""}
          >
            <Heart
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/favorites" ? "text-white" : ""} ${
                isCollapsed ? "" : "mr-3"
              }`}
            />
            {!isCollapsed && "Favorites"}
          </Link>

          <Link
            href="/profile"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/profile" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Profile" : ""}
          >
            <User
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/profile" ? "text-white" : ""} ${
                isCollapsed ? "" : "mr-3"
              }`}
            />
            {!isCollapsed && "Profile"}
          </Link>

          <Link
            href="/offers"
            className={`group flex items-center px-2 py-3 text-sm font-medium rounded-xl ${
              pathname === "/offers" ? "bg-primary text-white font-semibold" : "text-gray-600 hover:text-primary"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Offers" : ""}
          >
            <Settings
              className={`h-5 w-5 flex-shrink-0 ${pathname === "/offers" ? "text-white" : ""} ${
                isCollapsed ? "" : "mr-3"
              }`}
            />
            {!isCollapsed && "Offers"}
          </Link>
        </nav>

        {/* How to Order Section - positioned at bottom */}
        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 mt-auto">
            <div>
              <Image
                src="/how-to-order.png"
                alt="How to order food delivery"
                width={200}
                height={120}
                className="w-full h-auto rounded-2xl mb-3"
              />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">How to order food?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Order delicious food with ease and satisfy your cravings instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
