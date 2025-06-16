"use client"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()

  return null // Don't render this navigation bar at all
}
