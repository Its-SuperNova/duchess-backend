"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("[ProtectedRoute] Auth state update:", {
      hasUser: !!user,
      loading,
      userDetails: user
        ? {
            id: user.id,
            email: user.email,
            lastSignIn: user.last_sign_in_at,
          }
        : null,
    });

    if (!loading && !user) {
      console.log("[ProtectedRoute] No user found, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  // Only show loading state if we're loading AND don't have a user
  if (loading && !user) {
    console.log("[ProtectedRoute] Initial loading state, showing spinner");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a user but still loading (probably fetching profile), render children
  if (user) {
    console.log("[ProtectedRoute] User present, rendering children");
    return <>{children}</>;
  }

  // If no user and not loading, return null (will trigger redirect in useEffect)
  console.log("[ProtectedRoute] No user and not loading, returning null");
  return null;
}
