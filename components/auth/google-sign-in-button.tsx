"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to home page when user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("User authenticated, redirecting to home page");
      router.push("/");
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log("Starting Google sign-in...");
      // Let NextAuth handle the redirect to Google OAuth
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      variant="outline"
      className="flex h-12 w-full items-center justify-center rounded-full border border-gray-300 bg-white px-4 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      <span className="text-sm font-medium text-gray-700">
        {isLoading ? "Signing in..." : "Continue with Google"}
      </span>
    </Button>
  );
}
