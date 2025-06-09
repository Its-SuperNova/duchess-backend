"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LogOut,
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Settings,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Reusable Empty State Component
const EmptyState = ({
  icon: Icon,
  message,
  buttonText,
  buttonHref,
}: {
  icon: React.ElementType;
  message: string;
  buttonText: string;
  buttonHref: string;
}) => (
  <div className="text-center py-8">
    <Icon className="mx-auto h-12 w-12 text-gray-300" />
    <p className="mt-2 text-gray-500">{message}</p>
    <Button variant="outline" className="mt-4" asChild>
      <Link href={buttonHref}>{buttonText}</Link>
    </Button>
  </div>
);

export default function ProfilePage() {
  const { profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && profile) {
      setIsLoading(false);
    }
  }, [loading, profile]);

  useEffect(() => {
    console.log("[Profile] State update:", {
      hasProfile: !!profile,
      loading,
      isLoading,
      profileId: profile?.id,
      fullName: profile?.full_name,
    });
  }, [profile, loading, isLoading]);

  if (!isClient) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-x-6 md:space-y-0">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2 text-center md:text-left">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="mb-6 h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-x-6 md:space-y-0">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
            <Image
              src={profile?.avatar_url || "/profile-avatar.png"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-gray-500">
              {profile?.email || "No email provided"}
            </p>
            <div className="flex justify-center md:justify-start">
              <Link href="/profile/edit">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Edit Profile"
                  className="mr-2"
                >
                  Edit Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                aria-label="Logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <User className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">
                  Account Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">
                      {profile?.full_name || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">
                      {profile?.email || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member Since:</span>
                    <span className="font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "Not available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Login:</span>
                    <span className="font-medium">
                      {profile?.last_sign_in_at
                        ? new Date(profile.last_sign_in_at).toLocaleDateString()
                        : "Not available"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">Recent Orders</h3>
                <EmptyState
                  icon={ShoppingBag}
                  message="No recent orders"
                  buttonText="Start Shopping"
                  buttonHref="/categories"
                />
              </div>
            </div>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium">Your Orders</h3>
              <EmptyState
                icon={ShoppingBag}
                message="You haven't placed any orders yet"
                buttonText="Browse Products"
                buttonHref="/categories"
              />
            </div>
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Addresses</h3>
                <Link href="/profile/addresses/new">
                  <Button size="sm">Add New Address</Button>
                </Link>
              </div>
              <EmptyState
                icon={MapPin}
                message="No addresses saved"
                buttonText="Add Address"
                buttonHref="/profile/addresses/new"
              />
            </div>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium">Your Wishlist</h3>
              <EmptyState
                icon={Heart}
                message="Your wishlist is empty"
                buttonText="Discover Products"
                buttonHref="/categories"
              />
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Personal Information</h4>
                    <p className="text-sm text-gray-500">
                      Update your personal details
                    </p>
                  </div>
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-500">
                      Change your password
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-gray-500">
                      Manage your notification preferences
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
