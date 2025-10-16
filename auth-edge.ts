import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible auth configuration for middleware
export const { auth: edgeAuth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
});
