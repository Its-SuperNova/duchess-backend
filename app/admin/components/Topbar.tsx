"use client"

import { cn } from "@/lib/utils"

import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ui/ModeToggle"
import { useEffect, useState } from "react"

interface TopbarProps {
  sidebarExpanded?: boolean
}

export default function Topbar({ sidebarExpanded = true }: TopbarProps) {
  const [title, setTitle] = useState("Dashboard")
  const [isMobile, setIsMobile] = useState(false)

  // Update title based on pathname
  useEffect(() => {
    const pathname = window.location.pathname
    if (pathname === "/admin") setTitle("Dashboard")
    else if (pathname.includes("/admin/orders")) setTitle("Orders")
    else if (pathname.includes("/admin/products")) setTitle("Products")
    else if (pathname.includes("/admin/categories")) setTitle("Categories")
    else if (pathname.includes("/admin/users")) setTitle("Users")
    else if (pathname.includes("/admin/banners")) setTitle("Banners")
    else if (pathname.includes("/admin/payments")) setTitle("Payments")
    else if (pathname.includes("/admin/reviews")) setTitle("Reviews")
    else if (pathname.includes("/admin/coupons")) setTitle("Coupons")
    else if (pathname.includes("/admin/settings")) setTitle("Settings")
  }, [])

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-2 sm:px-4 shadow-sm transition-all duration-300",
        sidebarExpanded ? "lg:pl-4" : "lg:pl-4",
      )}
    >
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {!isMobile && (
        <div className="flex-1 mx-2 sm:mx-4 md:mx-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-full pl-8 rounded-md" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-4">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />
        </Button>
        <Avatar>
          <AvatarImage src="/profile-placeholder.png" alt="Admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
