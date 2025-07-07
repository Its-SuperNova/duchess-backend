import type React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNav } from "@/components/desktop-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="w-full flex-grow">
        <MobileNav />
        <DesktopNav />
        <main className="pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
