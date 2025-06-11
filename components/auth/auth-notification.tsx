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
    // Show success message when user is authenticated for the first time
    if (
      status === "authenticated" &&
      session?.user &&
      !hasShownNotification.current
    ) {
      hasShownNotification.current = true;

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
    }
  }, [status, session, toast]);

  // This component doesn't render anything visible
  return null;
}
