"use client"

import type React from "react"
import "./styles.css"
import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import { ThemeProvider } from "@/components/theme-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Load sidebar state from localStorage
  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("adminSidebarExpanded")
      if (savedState !== null) {
        setSidebarExpanded(savedState === "true")
      }
    }
  }, [])

  if (!isMounted) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar sidebarExpanded={sidebarExpanded} />
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="responsive-padding max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
