"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { isUserAdmin } from "@/lib/auth-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "moderator";
  fallback?: React.ReactNode;
}

export default function RoleGuard({
  children,
  requiredRole = "admin",
  fallback,
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      if (session?.user?.email) {
        try {
          let hasAccess = false;

          if (requiredRole === "admin") {
            hasAccess = await isUserAdmin(session.user.email);
          } else if (requiredRole === "moderator") {
            // For moderator, we'll check if they're admin or moderator
            const { isUserModerator } = await import("@/lib/auth-utils");
            hasAccess = await isUserModerator(session.user.email);
          }

          setHasPermission(hasAccess);
        } catch (error) {
          console.error("Error checking user permission:", error);
          setHasPermission(false);
        }
      } else {
        setHasPermission(false);
      }

      setLoading(false);
    }

    checkPermission();
  }, [session, status, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {status === "unauthenticated"
                ? "Please sign in to continue."
                : `This page requires ${requiredRole} privileges.`}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {status === "unauthenticated" ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/login">Sign In</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/">Go Home</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
