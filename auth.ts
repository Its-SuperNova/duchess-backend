import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "./lib/auth-utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user) {
        try {
          // Extract user data from Google profile
          const userData = {
            email: user.email!,
            name: user.name!,
            image: user.image || undefined,
            provider: account.provider,
            provider_id: profile?.sub || account.providerAccountId,
          };

          // Store user data in Supabase
          const storedUser = await upsertUser(userData);

          if (storedUser) {
            console.log("User data stored successfully:", storedUser.email);
          } else {
            console.error("Failed to store user data");
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }

      return true;
    },
  },
});
