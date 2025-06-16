"use client"

import { FcGoogle } from "react-icons/fc"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export default function GoogleSignInButton() {
  const { googleSignIn, loading } = useAuth()

  return (
    <Button
      variant="outline"
      className="flex h-12 w-full items-center justify-center rounded-full border border-gray-300 bg-white px-4 shadow-sm transition-colors hover:bg-gray-50"
      onClick={googleSignIn}
      disabled={loading}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      <span className="text-sm font-medium text-gray-700">Continue with Google</span>
    </Button>
  )
}
