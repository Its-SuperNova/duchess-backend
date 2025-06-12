"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

export default function AuthNotification() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const hasShownNotification = useRef(false);

  useEffect(() => {
    // Check if we've already shown the notification for this session
    const hasShownForSession = localStorage.getItem(
      `auth-notification-${session?.user?.email}`
    );

    // Show success message when user is authenticated for the first time
    if (
      status === "authenticated" &&
      session?.user &&
      !hasShownNotification.current &&
      !hasShownForSession
    ) {
      hasShownNotification.current = true;

      // Mark that we've shown the notification for this user session
      localStorage.setItem(`auth-notification-${session.user.email}`, "true");

      toast({
        title: "Authentication Successful! 🎉",
        description: `Welcome back, ${
          session.user.name || "User"
        }! You have been successfully signed in.`,
        duration: 5000, // Show for 5 seconds
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }

    // Reset the flag when user signs out
    if (status === "unauthenticated") {
      hasShownNotification.current = false;
      // Clear the notification flag for all users when signing out
      // This ensures the notification shows again when they sign back in
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("auth-notification-")) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [status, session, toast]);

  // This component doesn't render anything visible
  return null;
}
