import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if user is trying to access admin routes
  if (pathname.startsWith("/admin")) {
    // If user is not authenticated, redirect to login
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based access is handled by RoleGuard component
    // Additional role validation could be added here if needed
  }
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
