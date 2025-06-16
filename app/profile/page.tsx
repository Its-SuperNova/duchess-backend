"use client";

import { useState } from "react";
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

export default function ProfilePage() {
  const { profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
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
                <Button variant="outline" size="sm" className="mr-2">
                  Edit Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="mb-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

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
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">No recent orders</p>
                  <Button variant="outline" className="mt-4">
                    <Link href="/categories">Start Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium">Your Orders</h3>
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">
                  You haven't placed any orders yet
                </p>
                <Button variant="outline" className="mt-4">
                  <Link href="/categories">Browse Products</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Addresses</h3>
                <Link href="/profile/addresses/new">
                  <Button size="sm">Add New Address</Button>
                </Link>
              </div>
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">No addresses saved</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-medium">Your Wishlist</h3>
              <div className="text-center py-8">
                <Heart className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">Your wishlist is empty</p>
                <Button variant="outline" className="mt-4">
                  <Link href="/categories">Discover Products</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

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
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-gray-500">
                      Manage your notification preferences
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
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
