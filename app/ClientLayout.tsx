"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Header from "@/components/block/Header";
import DesktopHeader from "@/components/block/DesktopHeader";
import BottomNav from "@/components/block/BottomNav";
import UserSidebar from "@/components/user-sidebar";
import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import AuthNotification from "@/components/auth/auth-notification";
import SplashScreen from "@/components/splashscreen";
import OnboardingPage from "@/app/onboarding/page";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isHomePage = pathname === "/";
  const isProfileRoute = pathname.startsWith("/profile");
  const isFAQPage = pathname === "/faq";
  const isOnboardingPage = pathname === "/onboarding";
  const isProductPage = pathname.startsWith("/products/");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const previousStatus = useRef<string | null>(null);

  // Check if user has seen onboarding before
  const hasSeenOnboarding = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasSeenOnboarding") === "true";
    }
    return false;
  };

  // Check if we should show onboarding
  const shouldShowOnboarding = () => {
    return (
      status === "unauthenticated" &&
      !hasSeenOnboarding() &&
      !isAuthRoute &&
      !isOnboardingPage
    );
  };

  // Hide splash screen after it completes
  const handleSplashComplete = () => {
    setShowSplash(false);

    // After splash screen completes, check if we should show onboarding
    if (shouldShowOnboarding()) {
      setShowOnboarding(true);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Mark onboarding as seen
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenOnboarding", "true");
    }
  };

  // Show splash screen on every reload/initial load
  useEffect(() => {
    setShowSplash(true);
    setShowOnboarding(false);
  }, []);

  // Reset onboarding state when user gets authenticated
  useEffect(() => {
    if (status === "authenticated") {
      setShowOnboarding(false);
    }
  }, [status]);

  // Clear onboarding flag when user logs out (status changes from authenticated to unauthenticated)
  useEffect(() => {
    if (
      previousStatus.current === "authenticated" &&
      status === "unauthenticated" &&
      typeof window !== "undefined"
    ) {
      // User just logged out, clear onboarding flag so they can see it again
      localStorage.removeItem("hasSeenOnboarding");
    }
    previousStatus.current = status;
  }, [status]);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CartProvider>
          {/* Always show splash screen first on every reload */}
          {showSplash && (
            <SplashScreen onAnimationComplete={handleSplashComplete} />
          )}

          {/* Show onboarding for unauthenticated users after splash */}
          {!showSplash && showOnboarding && status === "unauthenticated" && (
            <OnboardingPage onOnboardingComplete={handleOnboardingComplete} />
          )}

          {/* Only render main UI when splash screen and onboarding are not showing */}
          {!showSplash && !showOnboarding && (
            <>
              <AuthNotification />
              {!isAdminRoute &&
                !isHomePage &&
                !isProfileRoute &&
                !isFAQPage &&
                !isAuthRoute &&
                !isOnboardingPage && (
                  <>
                    {isProductPage ? (
                      <DesktopHeader />
                    ) : (
                      <Header
                        isCollapsed={
                          !isAdminRoute && !isAuthRoute
                            ? isCollapsed
                            : undefined
                        }
                      />
                    )}
                  </>
                )}
              <div className="flex w-full">
                {!isAdminRoute && !isAuthRoute && !isOnboardingPage && (
                  <UserSidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                  />
                )}
                <main
                  className={`flex-1 transition-all duration-300 ${
                    !isAdminRoute &&
                    !isAuthRoute &&
                    !isOnboardingPage &&
                    !isCollapsed
                      ? "lg:ml-64"
                      : !isAdminRoute && !isAuthRoute && !isOnboardingPage
                      ? "lg:ml-16"
                      : ""
                  }`}
                >
                  {children}
                </main>
              </div>
              {!isAdminRoute &&
                !isProfileRoute &&
                !isFAQPage &&
                !isAuthRoute &&
                !isOnboardingPage && <BottomNav />}
              <Toaster />
              <SonnerToaster />
            </>
          )}
        </CartProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
