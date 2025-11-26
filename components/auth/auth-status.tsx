"use client";

import { useSession } from "next-auth/react";
import { useOTPAuth } from "@/context/otp-auth-context";

export default function AuthStatus() {
  const { data: session } = useSession();
  const { user: otpUser } = useOTPAuth();

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 text-sm">
      <h3 className="font-bold mb-2">Authentication Status</h3>
      <div className="space-y-1">
        <div>
          <strong>Google OAuth:</strong>{" "}
          {session?.user ? (
            <span className="text-green-600">✅ {session.user.email}</span>
          ) : (
            <span className="text-gray-500">❌ Not authenticated</span>
          )}
        </div>
        <div>
          <strong>OTP Auth:</strong>{" "}
          {otpUser ? (
            <span className="text-green-600">✅ {otpUser.email}</span>
          ) : (
            <span className="text-gray-500">❌ Not authenticated</span>
          )}
        </div>
        <div>
          <strong>Overall Status:</strong>{" "}
          {session?.user || otpUser ? (
            <span className="text-green-600">✅ Authenticated</span>
          ) : (
            <span className="text-red-600">❌ Not authenticated</span>
          )}
        </div>
      </div>
    </div>
  );
}
