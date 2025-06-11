"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import DesktopHeader from "@/components/block/DesktopHeader";
import { ProfileSkeleton } from "./profile-skeleton";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LogOut,
  User,
  MapPin,
  Lock,
  ShoppingBag,
  Truck,
  HelpCircle,
  Phone,
  AlertTriangle,
  ShieldCheck,
  FileText,
  RefreshCcw,
  Package,
  ChevronRight,
  Moon,
  Heart,
  Sun,
} from "lucide-react";

// Mock profile data type
interface Profile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Mock data for demonstration, matching the Figma numbers
  const totalOrders = 12;
  const totalFavorites = 12;

  // Mock signOut function
  const signOut = () => {
    // TODO: Implement actual sign out logic
    console.log("Signing out...");
  };

  // Simulate loading profile data
  useEffect(() => {
    const loadProfile = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock profile data
      setProfile({
        full_name: "Ashwin",
        email: "ashwin@gmail.com",
        avatar_url: undefined, // Will use fallback
      });

      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DesktopHeader />
      <div className="min-h-screen bg-[#f4f4f7] py-8 px-4">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl mx-auto space-y-4 pb-20">
          {/* Top Section for Desktop: User Info, Logout, Stats */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-4">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 lg:flex-grow lg:min-h-[140px] lg:justify-center">
              <Avatar className="h-16 w-16 border-2 border-gray-100">
                <AvatarImage
                  src={
                    profile?.avatar_url ||
                    "/placeholder.svg?height=64&width=64&query=skull with headphones"
                  }
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback className="bg-[#e0eeff] text-[#238aff] text-xl font-semibold">
                  {getInitials(profile?.full_name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h1 className="text-xl font-semibold text-[#000000]">
                  {profile?.full_name || "Ashwin"}
                </h1>
                <p className="text-sm text-[#858585]">
                  {profile?.email || "ashwin@gmail.com"}
                </p>
              </div>
              {/* Logout and Theme Toggle buttons for desktop, hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="flex items-center justify-center gap-2 border border-gray-200 rounded-md"
                  onClick={() => setIsDark((prev) => !prev)}
                >
                  {isDark ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="flex items-center justify-center text-[#ff0000] hover:bg-red-50 border border-gray-200 rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Log out</span>
                </Button>
              </div>
            </div>

            {/* Stats Cards for Desktop */}
            <div className="grid grid-cols-2 gap-4 mt-4 lg:mt-0 lg:w-1/2 xl:w-2/5">
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="bg-[#e0eeff] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="h-6 w-6 text-[#238aff]" />
                </div>
                <div className="text-2xl font-bold text-[#000000]">
                  {totalOrders}
                </div>
                <div className="text-sm text-[#858585]">Total Orders</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="bg-[#ffe0ed] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6 text-[#ff2d7e]" />
                </div>
                <div className="text-2xl font-bold text-[#000000]">
                  {totalFavorites}
                </div>
                <div className="text-sm text-[#858585]">Favorites</div>
              </div>
            </div>
          </div>

          {/* Appearance Section (only on mobile, hidden on desktop as per Figma) */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-4">
              <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-[#9b99ab]" />
              </div>
              <span className="text-[#000000]">Appearance</span>
            </div>
            <div className="flex items-center gap-2 text-[#858585]">
              <span>Light</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Main Content Sections for Desktop */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Account Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold text-[#000000] flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Account</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Your Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="/profile/addresses"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Manage Address</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Change Password</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                </div>
              </div>

              {/* Support & Help Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold text-[#000000] flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Support & Help</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">FAQs</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Contact Us</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Report a Problem</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 mt-4 lg:mt-0">
              {/* Orders Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold text-[#000000] flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Orders</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="/profile/orders"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">My Orders</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="/profile/orders/track"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Track Order</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                </div>
              </div>

              {/* Legal Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h2 className="text-lg font-semibold text-[#000000] flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Legal</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Privacy Policy</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">Terms & Conditions</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <RefreshCcw className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">
                        Refund & Cancellation
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#9b99ab]" />
                      </div>
                      <span className="text-[#000000]">
                        Shipping & Delivery
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Logout button for mobile, hidden on desktop - now after Legal section */}
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full bg-white rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between text-[#ff0000] hover:bg-red-50 lg:hidden"
          >
            <div className="flex items-center gap-4">
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* App Version */}
          <div className="text-center text-[#858585] text-xs pt-4">
            <p>Duchess v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
