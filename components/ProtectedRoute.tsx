"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.warn("[ProtectedRoute] Redirecting: user not authenticated.");
      router.push("/login");
    }
  }, [user, loading, router]);

  // Case 1: Still checking auth (show loading)
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated user, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // Case 3: Not loading and no user — just return null while redirect happens
  return null;
}
