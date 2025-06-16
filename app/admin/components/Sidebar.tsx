"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Users,
  ImageIcon,
  CreditCard,
  MessageSquare,
  Ticket,
  Settings,
  X,
  User,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  expanded?: boolean
  setExpanded?: (expanded: boolean) => void
}

export default function Sidebar({ className, expanded = true, setExpanded, ...props }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleToggleMobileSidebar = () => {
      setIsSheetOpen(true)
    }

    window.addEventListener("toggle-mobile-sidebar", handleToggleMobileSidebar)

    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleToggleMobileSidebar)
    }
  }, [])

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Update localStorage when sidebar state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSidebarExpanded", expanded.toString())
      window.dispatchEvent(new Event("adminSidebarStateChange"))
    }
  }, [expanded])

  const toggleExpanded = () => {
    if (setExpanded) {
      setExpanded(!expanded)
    }
  }

  const mainRoutes = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Banners",
      href: "/admin/banners",
      icon: ImageIcon,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
      icon: MessageSquare,
    },
    {
      name: "Coupons",
      href: "/admin/coupons",
      icon: Ticket,
    },
  ]

  const bottomRoutes = [
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  // Custom button style for expand/collapse buttons
  const toggleButtonClass = "h-8 w-8 rounded-md border border-border bg-background hover:bg-muted"

  // Determine active and hover styles based on theme
  const getActiveClass = (isActive: boolean) => {
    if (theme === "dark") {
      return isActive
        ? "bg-blue-900/30 text-blue-400"
        : "text-muted-foreground hover:bg-blue-900/20 hover:text-blue-400"
    }
    return isActive ? "bg-blue-50 text-blue-700" : "text-muted-foreground hover:bg-blue-50 hover:text-blue-700"
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center justify-between border-b px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Package className="h-4 w-4" />
          </span>
          {expanded && <span className="text-lg font-semibold">Duchess Admin</span>}
        </Link>
        {expanded && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleExpanded}
            className={cn("hidden lg:flex", toggleButtonClass)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Collapse sidebar</span>
          </Button>
        )}
        {isMobile && expanded && (
          <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="lg:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      <div className="flex flex-col h-[calc(100%-8rem)]">
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {mainRoutes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => isMobile && setIsSheetOpen(false)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md px-3 transition-colors",
                    getActiveClass(isActive),
                    !expanded && "justify-center px-0",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {expanded && <span>{route.name}</span>}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="mt-auto border-t py-4">
          <nav className="flex flex-col gap-1 px-2">
            {bottomRoutes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => isMobile && setIsSheetOpen(false)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md px-3 transition-colors",
                    getActiveClass(isActive),
                    !expanded && "justify-center px-0",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {expanded && <span>{route.name}</span>}
                </Link>
              )
            })}

            {/* Expand button at the bottom when collapsed */}
            {!expanded && (
              <div className="flex justify-center mt-4 px-2">
                <Button variant="outline" size="icon" onClick={toggleExpanded} className={toggleButtonClass}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Expand sidebar</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )

  // Desktop sidebar
  if (!isMobile) {
    return (
      <aside
        className={cn(
          "h-screen border-r transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-16",
          className,
        )}
        {...props}
      >
        <SidebarContent />
      </aside>
    )
  }

  // Mobile sidebar

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="p-0 w-[85vw] max-w-[300px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
