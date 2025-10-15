import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { upsertUser, getUserByEmail } from "./lib/auth-utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        sessionToken: { label: "Session Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.sessionToken) {
          return null;
        }

        try {
          // Get user from database
          const user = await getUserByEmail(credentials.email as string);

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }

          return null;
        } catch (error) {
          console.error("Error in OTP authorize:", error);
          return null;
        }
      },
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
