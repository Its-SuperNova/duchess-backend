"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OTPUser {
  email: string;
  name: string;
  id: string;
}

interface OTPAuthContextType {
  user: OTPUser | null;
  login: (userData: OTPUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const OTPAuthContext = createContext<OTPAuthContextType | undefined>(undefined);

export function OTPAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OTPUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = () => {
      try {
        const sessionToken = localStorage.getItem("otp_session_token");
        const userData = localStorage.getItem("otp_user_data");

        if (sessionToken && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Clear invalid session data
        localStorage.removeItem("otp_session_token");
        localStorage.removeItem("otp_user_data");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData: OTPUser) => {
    setUser(userData);
    // Store session data in localStorage
    localStorage.setItem("otp_user_data", JSON.stringify(userData));
    localStorage.setItem(
      "otp_session_token",
      `otp_${userData.email}_${Date.now()}`
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("otp_session_token");
    localStorage.removeItem("otp_user_data");
    router.push("/login");
  };

  return (
    <OTPAuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </OTPAuthContext.Provider>
  );
}

export function useOTPAuth() {
  const context = useContext(OTPAuthContext);
  if (context === undefined) {
    throw new Error("useOTPAuth must be used within an OTPAuthProvider");
  }
  return context;
}
