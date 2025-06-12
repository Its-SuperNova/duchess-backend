"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/block/Header";
import BottomNav from "@/components/block/BottomNav";
import UserSidebar from "@/components/user-sidebar";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import AuthNotification from "@/components/auth/auth-notification";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isHomePage = pathname === "/";
  const isProfileRoute = pathname.startsWith("/profile");
  const isFAQPage = pathname === "/faq";
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CartProvider>
          <AuthNotification />
          {!isAdminRoute &&
            !isHomePage &&
            !isProfileRoute &&
            !isFAQPage &&
            !isAuthRoute && (
              <Header
                isCollapsed={
                  !isAdminRoute && !isAuthRoute ? isCollapsed : undefined
                }
              />
            )}
          <div className="flex w-full">
            {!isAdminRoute && !isAuthRoute && (
              <UserSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            )}
            <main
              className={`flex-1 transition-all duration-300 ${
                !isAdminRoute && !isAuthRoute && !isCollapsed
                  ? "lg:ml-64"
                  : !isAdminRoute && !isAuthRoute
                  ? "lg:ml-16"
                  : ""
              }`}
            >
              {children}
            </main>
          </div>
          {!isAdminRoute && !isProfileRoute && !isFAQPage && !isAuthRoute && (
            <BottomNav />
          )}
          <Toaster />
        </CartProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
