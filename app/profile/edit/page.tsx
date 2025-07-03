"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Save, Edit } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { getUserByEmail, updateUserProfile } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { refreshSession } from "@/lib/actions/auth";

interface ProfileData {
  full_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  avatar_url?: string;
}

export default function ProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    avatar_url: "",
  });
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (status === "loading") return;

      if (status === "authenticated" && session?.user?.email) {
        try {
          // Fetch user data from Supabase
          const userData = await getUserByEmail(session.user.email);

          if (userData) {
            setProfile({
              full_name: userData.name || "",
              email: userData.email || "",
              phone_number: userData.phone_number || "",
              date_of_birth: userData.date_of_birth || "",
              gender: userData.gender || "",
              avatar_url: userData.image || "",
            });
          } else {
            // Fallback to session data
            setProfile({
              full_name: session.user.name || "",
              email: session.user.email || "",
              phone_number: "",
              date_of_birth: "",
              gender: "",
              avatar_url: session.user.image || "",
            });
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
          // Fallback to session data
          setProfile({
            full_name: session.user.name || "",
            email: session.user.email || "",
            phone_number: "",
            date_of_birth: "",
            gender: "",
            avatar_url: session.user.image || "",
          });
        }
      } else {
        // Mock data for demonstration
        setProfile({
          full_name: "Ashwin",
          email: "ashwin@gmail.com",
          phone_number: "+91 98765 43210",
          date_of_birth: "1995-06-15",
          gender: "Male",
          avatar_url: "",
        });
      }
      setLoading(false);
    };

    loadProfileData();
  }, [session, status]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({
        ...prev,
        avatar_url: imageUrl,
      }));

      // Here you would typically upload the file to your server
      // For now, we'll just use the preview URL
      console.log("File selected:", file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!session?.user?.email) {
      console.error("No user email found");
      toast({
        title: "Authentication Error",
        description: "Please log in again to update your profile.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!profile.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!profile.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log("Updating profile with data:", {
        name: profile.full_name,
        phone_number: profile.phone_number,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        image: profile.avatar_url,
      });

      // Update user profile in Supabase
      const updatedUser = await updateUserProfile(session.user.email, {
        name: profile.full_name.trim(),
        phone_number: profile.phone_number.trim() || null,
        date_of_birth: profile.date_of_birth || null,
        gender: profile.gender || null,
        image: profile.avatar_url || null,
      });

      if (updatedUser) {
        console.log("Profile updated successfully:", updatedUser);

        // Try to refresh the session
        try {
          await refreshSession();
        } catch (sessionError) {
          console.warn("Failed to refresh session:", sessionError);
        }

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully!",
          className:
            "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200 p-4 min-h-[60px]",
        });

        // Force a page refresh to update the session data
        setTimeout(() => {
          window.location.href = "/profile";
        }, 2000);
      } else {
        console.error("Failed to update profile - no user returned");
        toast({
          title: "Profile Update Error",
          description:
            "There was an error updating your profile. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Profile Update Error",
        description:
          error instanceof Error
            ? error.message
            : "There was an error updating your profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || !mounted) {
    return (
      <div className="h-[calc(100vh-70px)] bg-[#f4f4f7] dark:bg-[#18171C] lg:p-4">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 lg:p-0">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-6 w-24" />
            <div className="hidden lg:block">
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
            <div className="lg:hidden w-11" /> {/* Spacer for mobile */}
          </div>

          {/* Profile Form Skeleton */}
          <div className="bg-white dark:bg-[#202028] rounded-[52px] lg:rounded-[20px] shadow-sm p-6 border border-gray-200 dark:border-transparent pb-32">
            {/* Avatar Section Skeleton */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
              {/* Full Name */}
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Email */}
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Phone Number */}
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Date of Birth */}
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Gender */}
              <div className="lg:col-span-2">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Buttons Skeleton (Mobile Only) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#202028] border-t border-gray-200 dark:border-gray-700 px-4 py-6 z-50 lg:hidden">
          <div className="flex gap-3 max-w-md mx-auto">
            <Skeleton className="flex-1 h-[54px] rounded-lg" />
            <Skeleton className="flex-1 h-[54px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" h-[calc(100vh-70px)] bg-[#f4f4f7] dark:bg-[#18171C] lg:p-4 ">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-0">
          <Link href="/profile">
            <div className="bg-white dark:bg-[#202028] p-3 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <IoIosArrowBack className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold text-[#000000] dark:text-white absolute left-1/2 transform -translate-x-1/2">
            Edit Profile
          </h1>
          <div className="hidden lg:block">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/80 text-white text-[14px] rounded-xl px-4 py-2"
            >
              {saving ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-[#202028] rounded-[52px] lg:rounded-[20px] shadow-sm p-6 border border-gray-200 dark:border-transparent  pb-32">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-gray-100 dark:border-gray-600">
                <AvatarImage
                  src={profile.avatar_url || "/profile-avatar.png"}
                  alt={profile.full_name}
                />
                <AvatarFallback className="bg-gray-100 dark:bg-duchess-accent text-primary dark:text-white text-2xl font-semibold">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <button
              onClick={handleAvatarClick}
              className="text-primary font-medium hover:opacity-80 transition-opacity"
            >
              Edit
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
            <div>
              <Label
                htmlFor="full_name"
                className="text-sm font-medium text-[#000000] dark:text-white"
              >
                Full Name
              </Label>
              <Input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className="mt-2 bg-[#f4f4f7] dark:bg-[#18171C] border-gray-200 dark:border-gray-600 focus:border-primary"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[#000000] dark:text-white"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-2 bg-[#f4f4f7] dark:bg-[#18171C] border-gray-200 dark:border-gray-600 focus:border-primary"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <Label
                htmlFor="phone_number"
                className="text-sm font-medium text-[#000000] dark:text-white"
              >
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={profile.phone_number}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                className="mt-2 bg-[#f4f4f7] dark:bg-[#18171C] border-gray-200 dark:border-gray-600 focus:border-primary"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label
                htmlFor="date_of_birth"
                className="text-sm font-medium text-[#000000] dark:text-white"
              >
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={profile.date_of_birth}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
                className="mt-2 bg-[#f4f4f7] dark:bg-[#18171C] border-gray-200 dark:border-gray-600 focus:border-primary"
              />
            </div>

            <div className="lg:col-span-2">
              <Label
                htmlFor="gender"
                className="text-sm font-medium text-[#000000] dark:text-white"
              >
                Gender
              </Label>
              <select
                id="gender"
                value={profile.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="mt-2 w-full px-3 py-2 bg-[#f4f4f7] dark:bg-[#18171C] border border-gray-200 dark:border-gray-600 rounded-md focus:border-primary focus:outline-none text-[#000000] dark:text-white 
                  h-[40px]"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#202028] border-t border-gray-200 dark:border-gray-700 px-4 py-6 z-50 lg:hidden">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/profile")}
            className="flex-1 py-[22px] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-[22px] bg-primary hover:bg-primary/80 text-white rounded-lg"
          >
            {saving ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
