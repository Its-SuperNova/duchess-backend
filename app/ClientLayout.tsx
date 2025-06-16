"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Footer from "@/components/block/Footer"
import Header from "@/components/block/Header"
import BottomNav from "@/components/block/BottomNav" // Fixed: Changed from named import to default import

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") || false
  const isAuthRoute = pathname === "/login" || pathname === "/register"

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {!isAdminRoute && !isAuthRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
      <BottomNav />
      <Toaster />
    </ThemeProvider>
  )
}
