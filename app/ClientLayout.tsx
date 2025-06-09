"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/block/Footer";
import Header from "@/components/block/Header";
import BottomNav from "@/components/block/BottomNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname ?? "");
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {!isAdminRoute && !isAuthRoute && <Header />}
      <main className="flex-1 min-h-screen">{children}</main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
      {!isAdminRoute && !isAuthRoute && <BottomNav />}
      <Toaster />
    </ThemeProvider>
  );
}
