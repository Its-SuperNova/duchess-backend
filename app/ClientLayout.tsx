"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { CartProvider } from "@/context/cart-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { ThemeProvider } from "@/context/theme-context";
import { LayoutProvider } from "@/context/layout-context";
import AuthNotification from "@/components/auth/auth-notification";
import SWRProvider from "@/components/providers/swr-provider";
import SplashScreen from "@/components/splashscreen";
import OnboardingPage from "@/app/onboarding/page";
import UserHeader from "@/components/user-header";
import FixedOrderStatusBar from "@/components/fixed-order-status-bar";

// Inner component that can use cart and layout context
function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Route type checks
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isHomePage = pathname === "/";
  const isOnboardingPage = pathname === "/onboarding";
  const isTrackOrderPage = pathname === "/orders/track";

  // Hide header and user sidebar on all non-admin pages
  const showHeader =
    !isAdminRoute && !isAuthRoute && !isOnboardingPage && !isTrackOrderPage;

  const [showSplash, setShowSplash] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const previousStatus = useRef<string | null>(null);

  // Layout classes no longer used after removing header/sidebar

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

  // Do not show splash or onboarding on initial load
  useEffect(() => {
    setShowSplash(false);
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
        <OnboardingPage />
      )}

      {/* Only render main UI when splash screen and onboarding are not showing */}
      {!showSplash && !showOnboarding && (
        <>
          <AuthNotification />

          {showHeader && <UserHeader />}

          {/* Main Content - Add bottom padding for fixed order status bar */}
          <main className="flex-1 ">
            {isHomePage ? (
              <div className="mx-auto w-full max-w-[1200px]">{children}</div>
            ) : (
              children
            )}
          </main>

          {/* Footer */}
          {showHeader && (
            <footer className="w-full border-t border-gray-200 bg-white">
              <div className="mx-auto w-full max-w-[1200px] px-4 py-3">
                <div className="text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 text-center items-center">
                  <span className="col-span-2 sm:col-span-3 lg:col-span-1">
                    &copy; {new Date().getFullYear()} duchess pastry
                  </span>
                  <Link
                    href="/legal/privacy-policy"
                    className="hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/legal/terms-conditions"
                    className="hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                  <Link
                    href="/legal/refund-cancellation"
                    className="hover:underline"
                  >
                    Refund & Cancellation
                  </Link>
                  <Link
                    href="/legal/shipping-delivery"
                    className="hover:underline"
                  >
                    Shipping & Delivery
                  </Link>
                </div>
              </div>
            </footer>
          )}

          <Toaster />
          <SonnerToaster />

          {/* Fixed Order Status Bar - Only show on home page */}
          {isHomePage && <FixedOrderStatusBar />}
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
    <SWRProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <CartProvider>
            <LayoutProvider>
              <ClientLayoutInner>{children}</ClientLayoutInner>
            </LayoutProvider>
          </CartProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </SWRProvider>
  );
}
