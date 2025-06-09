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
    console.log("[ProtectedRoute] Auth state:", { user: !!user, loading });

    if (!loading && !user) {
      console.log("[ProtectedRoute] No user found, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    console.log("[ProtectedRoute] Still loading, showing loading state");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("[ProtectedRoute] No user, returning null");
    return null;
  }

  console.log("[ProtectedRoute] User authenticated, rendering children");
  return <>{children}</>;
}
