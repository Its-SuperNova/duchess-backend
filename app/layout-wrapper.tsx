"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import AuthNotification from "@/components/auth/auth-notification";
import ClientLayout from "./ClientLayout";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Force light theme for auth pages
  useEffect(() => {
    if (isAuthRoute) {
      const root = document.documentElement;
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isAuthRoute]);

  if (isAuthRoute) {
    return (
      <ThemeProvider>
        <FavoritesProvider>
          <CartProvider>
            <AuthNotification />
            <main className="flex-1">{children}</main>
            <Toaster />
            <SonnerToaster />
          </CartProvider>
        </FavoritesProvider>
      </ThemeProvider>
    );
  }

  return <ClientLayout>{children}</ClientLayout>;
}
