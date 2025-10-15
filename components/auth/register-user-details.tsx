"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface RegisterUserDetailsProps {
  email: string;
  sessionToken: string;
  onBack: () => void;
}

export default function RegisterUserDetails({
  email,
  sessionToken,
  onBack,
}: RegisterUserDetailsProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user profile with name and phone number
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          phoneNumber: phoneNumber.replace(/\s/g, ""),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: "Your profile has been created",
        });

        // Sign in using NextAuth with the OTP provider
        const result = await signIn("otp", {
          email: email,
          sessionToken: sessionToken,
          redirect: false,
        });

        if (result?.ok) {
          toast({
            title: "Welcome!",
            description: "You have been registered successfully",
          });
          router.push("/");
        } else {
          toast({
            title: "Error",
            description: "Failed to create session. Please try logging in.",
            variant: "destructive",
          });
          router.push("/login");
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 min-h-[400px] flex flex-col justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Complete Your Profile
        </h1>
        <p className="mt-2 text-gray-600">
          Please provide your details to complete registration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-lg border border-gray-300 bg-gray-50 px-4 focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your 10-digit phone number"
            value={phoneNumber}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                setPhoneNumber(value);
              }
            }}
            className="h-12 rounded-lg border border-gray-300 bg-gray-50 px-4 focus:border-primary focus:ring-primary"
            required
          />
          <p className="text-xs text-gray-500">
            We'll use this to contact you about your orders
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !phoneNumber.trim()}
          className="h-12 w-full rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating Account..." : "Complete Registration"}
        </Button>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}
