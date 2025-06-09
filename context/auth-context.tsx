"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type React from "react";

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

  useEffect(() => {
    let mounted = true;
    let isFetchingProfile = false;
    let sessionFetchTimeout: NodeJS.Timeout;
    let profileFetchTimeout: NodeJS.Timeout;

    const fetchProfile = async (userId: string) => {
      if (isFetchingProfile) return null;

      let retries = 0;
      const MAX_RETRIES = 3;

      while (retries < MAX_RETRIES) {
        try {
          isFetchingProfile = true;

          profileFetchTimeout = setTimeout(() => {
            console.warn("[Auth] Profile fetch delay...");
          }, 5000);

          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          clearTimeout(profileFetchTimeout);

          if (error) {
            console.warn(
              `[Auth] Profile fetch failed (${retries + 1}/${MAX_RETRIES})`
            );
            retries++;
            continue;
          }

          if (mounted) {
            setProfile(data);
            setLoading(false);
          }
          return data;
        } catch (err) {
          retries++;
        } finally {
          isFetchingProfile = false;
        }
      }

      if (mounted) {
        setProfile(null);
        setLoading(false);
      }

      return null;
    };

    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);

        sessionFetchTimeout = setTimeout(() => {
          console.warn("[Auth] Session fetch delay...");
        }, 5000);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        clearTimeout(sessionFetchTimeout);

        if (error || !session) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const currentUser = session.user;
        if (mounted) {
          setUser(currentUser);
        }

        await fetchProfile(currentUser.id);
      } catch (err) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const currentUser = session.user;
          if (mounted) {
            setUser(currentUser);
            await fetchProfile(currentUser.id);
          }
          router.refresh();
        }

        if (event === "SIGNED_OUT") {
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Registration successful! Check your email.");
      router.push("/login");
    } catch (error: any) {
      toast.error(`Sign up error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      toast.error(`Sign in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(`Google sign in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error(`Sign out error: ${error.message}`);
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
