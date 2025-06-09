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
    let mounted = true;
    let sessionFetchTimeout: NodeJS.Timeout;
    let profileFetchTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const fetchProfile = async (userId: string) => {
      try {
        console.log("[Auth] Starting profile fetch attempt", { retryCount });
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error("[Auth] Profile fetch error:", profileError.message);
          if (mounted) {
            setLoading(false);
            setProfile(null);
          }
          return null;
        }

        console.log("[Auth] Profile fetch complete:", {
          hasProfile: !!profileData,
          profileId: profileData?.id,
          fullName: profileData?.full_name,
        });

        if (mounted) {
          setProfile(profileData);
          setLoading(false);
        }
        return profileData;
      } catch (error) {
        console.error("[Auth] Profile fetch error:", error);
        if (mounted) {
          setLoading(false);
          setProfile(null);
        }
        return null;
      }
    };

    const fetchUserAndProfile = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        console.log("[Auth] Starting to fetch user and profile");

        // Add timeout for session fetch
        sessionFetchTimeout = setTimeout(() => {
          console.warn("[Auth] Session fetch taking longer than expected");
        }, 5000);

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        clearTimeout(sessionFetchTimeout);

        if (sessionError) {
          console.error("[Auth] Session error:", sessionError.message);
          if (mounted) {
            setLoading(false);
            setUser(null);
            setProfile(null);
          }
          return;
        }

        console.log("[Auth] Session fetch complete:", {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          lastSignIn: session?.user?.last_sign_in_at,
        });

        if (!session) {
          console.log("[Auth] No active session found");
          if (mounted) {
            setLoading(false);
            setUser(null);
            setProfile(null);
          }
          return;
        }

        // Set user from session
        if (mounted) {
          console.log("[Auth] Setting user from session");
          setUser(session.user);
        }

        // Add timeout for profile fetch
        profileFetchTimeout = setTimeout(() => {
          console.warn("[Auth] Profile fetch taking longer than expected");
        }, 5000);

        const profile = await fetchProfile(session.user.id);
        clearTimeout(profileFetchTimeout);

        // If profile fetch failed and we haven't exceeded retries, try again
        if (!profile && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log("[Auth] Retrying profile fetch", { retryCount });
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("[Auth] Context initialization error:", error);
        if (mounted) {
          setLoading(false);
          setUser(null);
          setProfile(null);
        }
      }
    };

    fetchUserAndProfile();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] Auth state changed:", {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
        });

        if (event === "SIGNED_IN" && session) {
          if (mounted) {
            console.log("[Auth] Setting user from SIGNED_IN event");
            setUser(session.user);
          }

          try {
            console.log("[Auth] Starting profile fetch after sign in");
            const profile = await fetchProfile(session.user.id);

            // If profile fetch failed and we haven't exceeded retries, try again
            if (!profile && retryCount < MAX_RETRIES) {
              retryCount++;
              console.log("[Auth] Retrying profile fetch after sign in", {
                retryCount,
              });
              await fetchProfile(session.user.id);
            }
          } catch (error) {
            console.error("[Auth] Error in profile fetch:", error);
            if (mounted) {
              setLoading(false);
            }
          }

          router.refresh();
        } else if (event === "SIGNED_OUT") {
          console.log("[Auth] Handling SIGNED_OUT event");
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          router.push("/login");
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(sessionFetchTimeout);
      clearTimeout(profileFetchTimeout);
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
