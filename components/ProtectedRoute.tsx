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
    console.log("[ProtectedRoute] Auth state:", {
      user: user
        ? {
            id: user.id,
            email: user.email,
            lastSignIn: user.last_sign_in_at,
          }
        : null,
      loading,
    });

    if (!loading && !user) {
      console.log("[ProtectedRoute] No user found, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    console.log("[ProtectedRoute] Still loading, showing loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No user, returning null");
    return null;
  }

  console.log("[ProtectedRoute] User authenticated, rendering children");
  return <>{children}</>;
}
