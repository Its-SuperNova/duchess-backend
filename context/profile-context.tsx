"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProfileData {
  id: string
  fullName: string
  email: string
  avatar_url: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

interface ProfileContextType {
  profile: ProfileData | null
  loading: boolean
  updateProfile: (data: Partial<ProfileData>) => void
  logout: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const fetchUserProfile = useCallback(async () => {
    setLoading(true)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error fetching session:", sessionError.message)
      setProfile(null)
      setLoading(false)
      return
    }

    if (session) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError.message)
        setProfile(null)
      } else {
        setProfile({
          id: profileData.id,
          fullName: profileData.full_name || session.user.email || "Guest",
          email: profileData.email || session.user.email || "",
          avatar_url: profileData.avatar_url,
          role: profileData.role,
          created_at: profileData.created_at,
          last_sign_in_at: profileData.last_sign_in_at,
        })
      }
    } else {
      setProfile(null)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchUserProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserProfile()
      if (_event === "SIGNED_OUT") {
        router.push("/login") // Redirect to login on sign out
        toast.info("You have been logged out.")
      }
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [fetchUserProfile, supabase.auth, router])

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null))
  }

  const logout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Failed to log out: " + error.message)
    } else {
      setProfile(null)
      // Redirection is handled by the onAuthStateChange listener
    }
    setLoading(false)
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, logout }}>{children}</ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
