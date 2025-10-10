"use client";

import type React from "react";
import "./styles.css";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import admin components to reduce initial bundle size
const Sidebar = dynamic(() => import("./components/Sidebar"), {
  ssr: false,
  loading: () => (
    <div className="w-16 lg:w-64 bg-gray-100 h-screen animate-pulse">
      <div className="p-4">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
});

const Topbar = dynamic(() => import("./components/Topbar"), {
  ssr: false,
  loading: () => (
    <div className="h-16 bg-gray-100 border-b animate-pulse">
      <div className="h-full flex items-center justify-between px-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  ),
});
import { ThemeProvider } from "@/components/theme-provider";
import RoleGuard from "@/components/auth/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Load sidebar state from localStorage
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("adminSidebarExpanded");
      if (savedState !== null) {
        setSidebarExpanded(savedState === "true");
      }
    }
  }, []);

  if (!isMounted) {
    return null; // Return null on server-side to prevent hydration mismatch
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <RoleGuard requiredRole="admin">
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
          <Sidebar
            expanded={sidebarExpanded}
            setExpanded={setSidebarExpanded}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar sidebarExpanded={sidebarExpanded} />
            <main className="flex-1 overflow-y-auto bg-[#f5f5f5] ">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ThemeProvider>
  );
}
