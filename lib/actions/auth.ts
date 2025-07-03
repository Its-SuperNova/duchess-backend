"use server";

import { signIn, signOut } from "@/auth";
import { updateSession } from "next-auth/react";

export async function signInWithGoogle() {
  console.log("signInWithGoogle called");
  await signIn("google");
}

export async function signOutWithGoogle() {
  console.log("signOutWithGoogle called");
  await signOut();
}

export async function refreshSession() {
  try {
    // This will trigger a session refresh
    await updateSession();
    return { success: true };
  } catch (error) {
    console.error("Error refreshing session:", error);
    return { success: false, error: "Failed to refresh session" };
  }
}
