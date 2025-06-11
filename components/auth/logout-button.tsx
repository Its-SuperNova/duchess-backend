"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Logging out... 👋",
        description: "You will be signed out shortly.",
        duration: 2000,
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });

      // Use client-side signOut which properly clears the session
      await signOut({
        callbackUrl: "/",
        redirect: false,
      });

      // Manually redirect to home page
      router.push("/");

      toast({
        title: "Logged Out Successfully! 👋",
        description: "You have been successfully signed out. Come back soon!",
        duration: 4000,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an error signing you out. Please try again.",
        duration: 4000,
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
