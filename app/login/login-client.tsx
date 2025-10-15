"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
import OTPVerification from "@/components/auth/otp-verification";
import { useToast } from "@/hooks/use-toast";

type LoginStep = "email" | "otp";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<LoginStep>("email");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOTP(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Code Sent",
          description: "Please check your email for the verification code",
        });
        setCurrentStep("otp");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleOTPSuccess = (user: any) => {
    // User is now authenticated
    console.log("User authenticated:", user);
    // The OTPVerification component will handle redirecting to home page
  };

  const handleBackToEmail = () => {
    setCurrentStep("email");
    setEmail("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 md:p-0">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl md:grid md:grid-cols-2">
        {/* Left Section - Image */}
        <div className="relative hidden h-full min-h-[400px] md:block">
          <Image
            src="https://res.cloudinary.com/dt85dgcrl/image/upload/v1760533609/Diwali_Deals_vp8zri.png"
            alt="Diwali Deals"
            layout="fill"
            objectFit="cover"
            className="rounded-3xl"
          />
        </div>

        {/* Right Section - Login Form */}
        <div className="flex flex-col items-center justify-center p-8 md:p-12 min-h-[500px]">
          <div className="w-full max-w-md space-y-6 min-h-[400px] flex flex-col justify-center">
            {currentStep === "email" ? (
              <>
                <div className="text-center">
                  <Image
                    src="/duchess-logo.png"
                    alt="Duchess Logo"
                    width={120}
                    height={40}
                    className="mx-auto mb-4"
                  />
                  <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                  <p className="mt-2 text-gray-600">
                    Enter your email to receive a verification code
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-lg border border-gray-300 bg-gray-50 px-4 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSendingOTP}
                    className="h-12 w-full rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSendingOTP
                      ? "Sending Code..."
                      : "Send Verification Code"}
                  </Button>
                </form>

                <div className="relative flex items-center justify-center">
                  <Separator className="absolute w-full" />
                  <span className="relative bg-white px-4 text-sm text-gray-500">
                    Or sign in with
                  </span>
                </div>

                <div className="flex justify-center">
                  <GoogleSignInButton />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <OTPVerification
                email={email}
                onBack={handleBackToEmail}
                onSuccess={handleOTPSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
