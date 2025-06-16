"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Fetch user and profile on mount
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError.message);
          return;
        }

        if (!session) {
          console.log("No active session");
          return;
        }

        // Set user from session
        setUser(session.user);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError.message);
          return;
        }

        setProfile(profileData);
        console.log("Profile loaded:", profileData);
      } catch (error) {
        console.error("Auth context initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session) {
          setUser(session.user);

          // Fetch profile after sign in
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error(
              "Error fetching profile after sign in:",
              error.message
            );
          } else {
            setProfile(profile);
          }

          router.refresh();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          router.push("/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      console.log("Signing up with:", { email, fullName });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Sign up error:", error.message);
        toast.error(error.message);
        return;
      }

      console.log("Sign up successful:", data);
      toast.success(
        "Registration successful! Please check your email to confirm your account."
      );
      router.push("/login");
    } catch (error: any) {
      console.error("Sign up exception:", error.message);
      toast.error(`An error occurred during sign up: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Signing in with email:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error.message);
        toast.error(error.message);
        return;
      }

      console.log("Sign in successful:", data);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Sign in exception:", error.message);
      toast.error(`An error occurred during sign in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const googleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Initiating Google sign in");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google sign in error:", error.message);
        toast.error(error.message);
      } else {
        console.log("Google sign in initiated:", data);
      }
    } catch (error: any) {
      console.error("Google sign in exception:", error.message);
      toast.error(`An error occurred during Google sign in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
        toast.error(error.message);
        return;
      }

      console.log("Sign out successful");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Sign out exception:", error.message);
      toast.error(`An error occurred during sign out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
