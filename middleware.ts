import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if user is trying to access admin routes
  if (pathname.startsWith("/admin")) {
    // If user is not authenticated, redirect to login
    if (!req.auth) {
      // Prevent redirect loop by checking if already on login page
      if (pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  // Check if user is trying to access profile routes
  if (pathname.startsWith("/profile")) {
    // If user is not authenticated, redirect to login
    if (!req.auth) {
      // Prevent redirect loop by checking if already on login page
      if (pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
