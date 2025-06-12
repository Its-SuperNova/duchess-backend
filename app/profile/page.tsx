"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import DesktopHeader from "@/components/block/DesktopHeader";
import { ProfileSkeleton } from "./profile-skeleton";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  Monitor,
  Check,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/theme-context";
import { getUserByEmail } from "@/lib/auth-utils";

// Mock profile data type
interface Profile {
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [themeState, setThemeState] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Try to get theme context, with fallback
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    // Theme context not available, use local state
    themeContext = {
      theme: themeState,
      resolvedTheme: themeState,
      toggleTheme: () =>
        setThemeState((prev) => (prev === "light" ? "dark" : "light")),
      setTheme: (theme: "light" | "dark" | "system") =>
        setThemeState(theme as "light" | "dark"),
    };
  }

  const { theme, resolvedTheme, toggleTheme, setTheme } = themeContext;

  // Mock data for demonstration, matching the Figma numbers
  const totalOrders = 12;
  const totalFavorites = 12;

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate loading profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (status === "loading") return;

      if (status === "authenticated" && session?.user?.email) {
        try {
          // Fetch user data from Supabase
          const userData = await getUserByEmail(session.user.email);

          if (userData) {
            setProfile({
              full_name: userData.name || "User",
              email: userData.email || "",
              phone_number: userData.phone_number,
              date_of_birth: userData.date_of_birth,
              gender: userData.gender,
              avatar_url: userData.image || undefined,
            });
          } else {
            // Fallback to session data
            setProfile({
              full_name: session.user.name || "User",
              email: session.user.email || "",
              phone_number: undefined,
              date_of_birth: undefined,
              gender: undefined,
              avatar_url: session.user.image || undefined,
            });
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
          // Fallback to session data
          setProfile({
            full_name: session.user.name || "User",
            email: session.user.email || "",
            phone_number: undefined,
            date_of_birth: undefined,
            gender: undefined,
            avatar_url: session.user.image || undefined,
          });
        }
      } else {
        setProfile({
          full_name: "Ashwin",
          email: "ashwin@gmail.com",
          phone_number: "+91 98765 43210",
          date_of_birth: "1995-06-15",
          gender: "Male",
          avatar_url: undefined,
        });
      }
      setLoading(false);
    };

    loadProfileData();
  }, [session, status]);

  if (loading || !mounted) {
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

  const getThemeDisplayName = (theme: string) => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "Use device theme";
      default:
        return "Light";
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "system":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  return (
    <>
      <DesktopHeader />
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl mx-auto space-y-4 pb-20">
          {/* Top Section for Desktop: User Info, Logout, Stats */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-4">
            {/* User Info Card */}
            <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 flex items-center gap-4 lg:flex-grow lg:min-h-[140px] lg:justify-center border border-gray-200 dark:border-transparent">
              {status === "authenticated" ? (
                <Avatar className="h-16 w-16 border-2 border-gray-100 dark:border-gray-600">
                  <AvatarImage
                    src={profile?.avatar_url || "/profile-avatar.png"}
                    alt={profile?.full_name || "User"}
                  />
                  <AvatarFallback className="bg-[#e0eeff] dark:bg-duchess-accent text-[#238aff] dark:text-white text-xl font-semibold">
                    {getInitials(profile?.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#f4f4f7] dark:bg-gray-700 flex items-center justify-center border-2 border-gray-100 dark:border-gray-600">
                  <User className="h-8 w-8 text-[#9b99ab] dark:text-gray-400" />
                </div>
              )}
              <div className="flex-grow">
                <h1 className="text-xl font-semibold text-[#000000] dark:text-white">
                  {status === "authenticated"
                    ? profile?.full_name || "User Name"
                    : "User Name"}
                </h1>
                <p className="text-sm text-[#858585] dark:text-gray-400">
                  {status === "authenticated"
                    ? profile?.email || "user@email.com"
                    : "user@email.com"}
                </p>
              </div>
              {/* Logout and Theme Toggle buttons for desktop, hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800"
                  onClick={toggleTheme}
                >
                  {getThemeIcon(theme)}
                  <span className="text-sm font-medium">
                    {getThemeDisplayName(theme)}
                  </span>
                </Button>
                {status === "authenticated" ? (
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="flex items-center justify-center text-[#ff0000] hover:text-[white]  dark:text-red-400 dark:hover:text-white bg-red-50 hover:bg-[#ff5a5a] dark:bg-red-900/20 dark:hover:bg-[#ff5a5a]  rounded-lg"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Log out</span>
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span>Login</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Cards for Desktop */}
            <div className="grid grid-cols-2 gap-4 mt-4 lg:mt-0 lg:w-1/2 xl:w-2/5">
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 text-center border border-gray-200 dark:border-transparent">
                <div className="bg-[#e0eeff] dark:bg-[#01499C] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="h-6 w-6 text-[#238aff] dark:text-[#8CC2FF]" />
                </div>
                <div className="text-2xl font-bold text-[#000000] dark:text-white">
                  {totalOrders}
                </div>
                <div className="text-sm text-[#858585] dark:text-gray-400">
                  Total Orders
                </div>
              </div>
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 text-center border border-gray-200 dark:border-transparent">
                <div className="bg-[#ffe0ed] dark:bg-[#A00043] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6 text-[#ff2d7e] dark:text-[#FFCADE]" />
                </div>
                <div className="text-2xl font-bold text-[#000000] dark:text-white">
                  {totalFavorites}
                </div>
                <div className="text-sm text-[#858585] dark:text-gray-400">
                  Favorites
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section (only on mobile, hidden on desktop as per Figma) */}
          <Drawer>
            <DrawerTrigger asChild>
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 flex items-center justify-between lg:hidden border border-gray-200 dark:border-transparent cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                    {resolvedTheme === "dark" ? (
                      <Moon className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                    ) : (
                      <Sun className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                    )}
                  </div>
                  <span className="text-[#000000] dark:text-white">
                    Appearance
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#858585] dark:text-gray-400">
                  <span>{getThemeDisplayName(theme)}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </DrawerTrigger>
            <DrawerContent className="dark:bg-[#18171C] dark:border-none">
              <DrawerHeader>
                <DrawerTitle className="text-left">Choose theme</DrawerTitle>
              </DrawerHeader>
              <div className="px-2 pb-8 space-y-0">
                {(["light", "dark", "system"] as const).map(
                  (themeOption, index) => (
                    <div key={themeOption}>
                      <button
                        onClick={() => setTheme(themeOption)}
                        className="w-full flex items-center justify-between p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-[#f4f4f7] dark:bg-[#202028] rounded-full w-10 h-10 flex items-center justify-center">
                            {getThemeIcon(themeOption)}
                          </div>
                          <span className="text-[#000000] dark:text-white font-medium">
                            {getThemeDisplayName(themeOption)}
                          </span>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          {theme === themeOption && (
                            <div className="w-3 h-3 rounded-full bg-[#238aff] dark:bg-[#8CC2FF]"></div>
                          )}
                        </div>
                      </button>
                    </div>
                  )
                )}
              </div>
            </DrawerContent>
          </Drawer>

          {/* Main Content Sections for Desktop */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Account Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <h2 className="text-lg font-semibold text-[#000000] dark:text-white flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Account</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Your Profile
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="/profile/addresses"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Manage Address
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Change Password
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Support & Help Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <h2 className="text-lg font-semibold text-[#000000] dark:text-white flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Support & Help</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        FAQs
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Contact Us
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Report a Problem
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 mt-4 lg:mt-0">
              {/* Orders Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <h2 className="text-lg font-semibold text-[#000000] dark:text-white flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Orders</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="/profile/orders"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        My Orders
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="/profile/orders/track"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Track Order
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Legal Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <h2 className="text-lg font-semibold text-[#000000] dark:text-white flex items-center gap-2 pt-4">
                  <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                  <span className="pl-4">Legal</span>
                </h2>
                <div className="space-y-2 py-4">
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Privacy Policy
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Terms & Conditions
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <RefreshCcw className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Refund & Cancellation
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#9b99ab] dark:text-[#9B99AB]" />
                      </div>
                      <span className="text-[#000000] dark:text-white">
                        Shipping & Delivery
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#858585] dark:text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Logout button for mobile, hidden on desktop - after Legal section */}
          {status === "authenticated" ? (
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="w-full bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between text-[#ff0000] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 lg:hidden mt-4 mb-4 border border-gray-200 dark:border-transparent"
            >
              <div className="flex items-center gap-4">
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Link href="/login" className="w-full lg:hidden block mt-4 mb-4">
              <Button
                variant="ghost"
                className="w-full bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#000000] dark:text-white">Login</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* App Version */}
          <div className="text-center text-[#858585] dark:text-gray-400 text-xs pt-4">
            <p>Duchess v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
