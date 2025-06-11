"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/block/Footer";
import Header from "@/components/block/Header";
import BottomNav from "@/components/block/BottomNav";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import AuthNotification from "@/components/auth/auth-notification";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <FavoritesProvider>
      <CartProvider>
        <AuthNotification />
        {!isAdminRoute && <Header />}
        <main className="flex-1 min-h-screen">{children}</main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <BottomNav />}
        <Toaster />
      </CartProvider>
    </FavoritesProvider>
  );
}
