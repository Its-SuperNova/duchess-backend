"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle() {
  console.log("signInWithGoogle called");
  await signIn("google");
}

export async function signOutWithGoogle() {
  console.log("signOutWithGoogle called");
  await signOut();
}
