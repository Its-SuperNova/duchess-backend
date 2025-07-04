import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./layout-wrapper";
import AuthSessionProvider from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

// Metadata needs to be in a separate file for client components
export const metadata: Metadata = {
  title: "Duchess Pastries",
  description: "Delicious pastries and desserts",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthSessionProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
