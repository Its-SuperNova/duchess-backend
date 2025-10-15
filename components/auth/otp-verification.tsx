"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: (user: any, token?: string) => void;
  isRegistration?: boolean;
}

export default function OTPVerification({
  email,
  onBack,
  onSuccess,
  isRegistration = false,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("🎉 OTP verification successful:", data.user);

        if (isRegistration) {
          // For registration, pass user and token to parent for profile completion
          toast({
            title: "Success!",
            description: "OTP verified successfully",
          });
          onSuccess(
            { ...data.user, sessionToken: data.sessionToken },
            data.sessionToken
          );
        } else {
          // For login, sign in immediately
          toast({
            title: "Success!",
            description: "Signing you in...",
          });

          // Sign in using NextAuth with the OTP provider
          const result = await signIn("otp", {
            email: email,
            sessionToken: data.sessionToken,
            redirect: false,
          });

          if (result?.ok) {
            toast({
              title: "Success!",
              description: "You have been signed in successfully",
            });
            onSuccess(data.user);
            router.push("/");
          } else {
            toast({
              title: "Error",
              description: "Failed to create session. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
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
          title: "OTP Sent",
          description: "A new code has been sent to your email",
        });
        setTimeLeft(300);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 min-h-[400px] flex flex-col justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Enter Verification Code
        </h1>
        <p className="mt-2 text-gray-600">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-primary focus:ring-primary"
            />
          ))}
        </div>

        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in {formatTime(timeLeft)}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Code expired. You can request a new one.
            </p>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying || otp.join("").length !== 6}
          className="h-12 w-full rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>

        <div className="flex justify-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            Back
          </Button>
          {canResend && (
            <Button
              variant="ghost"
              onClick={handleResend}
              className="text-primary hover:text-primary/80"
            >
              Resend Code
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
