"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import DesktopHeader from "@/components/block/DesktopHeader";
import BottomNav from "@/components/block/BottomNav";
import UserSidebar from "@/components/user-sidebar";
import CartSidebar from "@/components/cart-sidebar";
import { CartProvider, useCart } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import { LayoutProvider, useLayout } from "@/context/layout-context";
import AuthNotification from "@/components/auth/auth-notification";
import SplashScreen from "@/components/splashscreen";
import OnboardingPage from "@/app/onboarding/page";
import { useIsMobile } from "@/hooks/use-mobile";

// Inner component that can use cart and layout context
function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCartOpen, closeCart } = useCart();
  const {
    isUserSidebarCollapsed,
    setIsUserSidebarCollapsed,
    setIsCartSidebarOpen,
    getLayoutClasses,
  } = useLayout();

  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isMobile = useIsMobile();

  // Route type checks
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isHomePage = pathname === "/";
  const isProfileRoute = pathname.startsWith("/profile");
  const isFAQPage = pathname === "/faq";
  const isOnboardingPage = pathname === "/onboarding";
  const isProductPage = pathname.startsWith("/products/");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  // Layout component visibility - updated logic for mobile/desktop header behavior
  const showHeader = (() => {
    // Don't show header on these routes regardless of device
    if (
      isAdminRoute ||
      isFAQPage ||
      isAuthRoute ||
      isOnboardingPage ||
      isCheckoutRoute
    ) {
      return false;
    }

    // For mobile devices: only show header on home page
    if (isMobile) {
      return isHomePage;
    }

    // For desktop: show header on all allowed pages
    return true;
  })();
  const showSidebar =
    !isAdminRoute && !isAuthRoute && !isOnboardingPage && !isCheckoutRoute;
  const showBottomNav =
    !isAdminRoute &&
    !isFAQPage &&
    !isAuthRoute &&
    !isOnboardingPage &&
    !isCheckoutRoute;
  const useSidebarLayout = showSidebar;

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const previousStatus = useRef<string | null>(null);

  // Sync cart sidebar state with layout context
  useEffect(() => {
    setIsCartSidebarOpen(isCartOpen);
  }, [isCartOpen, setIsCartSidebarOpen]);

  // Get layout classes
  const { mainContentClasses, isCompact, isVeryCompact } = getLayoutClasses();

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
    <>
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

          {/* Desktop Header */}
          {showHeader && <DesktopHeader />}

          <div className="flex w-full">
            {/* User Sidebar */}
            {showSidebar && (
              <UserSidebar
                isCollapsed={isUserSidebarCollapsed}
                setIsCollapsed={setIsUserSidebarCollapsed}
              />
            )}

            {/* Main Content */}
            <main
              className={`${
                useSidebarLayout
                  ? `flex-1 transition-all duration-300 ${
                      !isAdminRoute ? "lg:pt-16" : ""
                    } ${isUserSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`
                  : `flex-1 ${!isAdminRoute ? "lg:pt-16" : ""}`
              }`}
              style={{
                marginRight:
                  useSidebarLayout && isCartOpen ? "24rem" : undefined,
              }}
            >
              {children}
            </main>

            {/* Cart Sidebar */}
            <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
          </div>

          {/* Bottom Navigation */}
          {showBottomNav && <BottomNav />}

          <Toaster />
          <SonnerToaster />
        </>
      )}
    </>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CartProvider>
          <LayoutProvider>
            <ClientLayoutInner>{children}</ClientLayoutInner>
          </LayoutProvider>
        </CartProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
