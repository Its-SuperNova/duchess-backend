"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";

export default function LoginClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic can be added here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 md:p-0">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl md:grid md:grid-cols-2">
        {/* Left Section - Image */}
        <div className="relative hidden h-full min-h-[400px] md:block">
          <Image
            src="/login-signup-banner.png"
            alt="Delicious cookies on a plate"
            layout="fill"
            objectFit="cover"
            className="rounded-3xl"
          />
        </div>

        {/* Right Section - Login Form */}
        <div className="flex flex-col items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md space-y-6">
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
                Hi! Welcome back, you've been missed
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-lg border border-gray-300 bg-gray-50 pr-10 focus:border-primary focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-primary text-white hover:bg-primary/90"
              >
                Sign In
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
          </div>
        </div>
      </div>
    </div>
  );
}
