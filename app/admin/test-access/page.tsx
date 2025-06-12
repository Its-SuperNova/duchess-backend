"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserRole, isUserAdmin, isUserModerator } from "@/lib/auth-utils";
import { Shield, User, UserCheck, CheckCircle, XCircle } from "lucide-react";

export default function TestAccessPage() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserPermissions() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        setLoading(false);
        return;
      }

      if (session?.user?.email) {
        try {
          const [role, adminStatus, moderatorStatus] = await Promise.all([
            getUserRole(session.user.email),
            isUserAdmin(session.user.email),
            isUserModerator(session.user.email),
          ]);

          setUserRole(role);
          setIsAdmin(adminStatus);
          setIsModerator(moderatorStatus);
        } catch (error) {
          console.error("Error checking permissions:", error);
        }
      }

      setLoading(false);
    }

    checkUserPermissions();
  }, [session, status]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "moderator":
        return <UserCheck className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "moderator":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

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

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to test role-based access control
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Access Control Test
        </h1>
        <p className="text-muted-foreground">
          Test your role-based access control permissions
        </p>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Current user details and authentication status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.name || "N/A"}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email || "N/A"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Authentication Status</p>
            <Badge variant="outline" className="mt-1">
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Your current role and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Current Role</p>
            {userRole ? (
              <Badge className={getRoleColor(userRole)}>
                <span className="flex items-center gap-1">
                  {getRoleIcon(userRole)}
                  {userRole}
                </span>
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Admin Access</span>
            </div>
            <div className="flex items-center gap-2">
              {isModerator ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Moderator Access</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Access Test Results</CardTitle>
          <CardDescription>What you can and cannot access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Access Granted
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Access Denied</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Moderator Features</span>
              </div>
              <div className="flex items-center gap-2">
                {isModerator ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Access Granted
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Access Denied</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">User Features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Access Granted</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>
              <strong>1. Test as Regular User:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Sign in with a regular user account</li>
              <li>
                Try to access <code>/admin</code> - should show "Access Denied"
              </li>
              <li>Check this page - should show role as "user"</li>
            </ul>
          </div>

          <div className="text-sm space-y-2">
            <p>
              <strong>2. Test as Admin:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>
                Run:{" "}
                <code>node scripts/setup-admin.js your-email@example.com</code>
              </li>
              <li>Sign in with the admin account</li>
              <li>
                Try to access <code>/admin</code> - should work
              </li>
              <li>Check this page - should show role as "admin"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
