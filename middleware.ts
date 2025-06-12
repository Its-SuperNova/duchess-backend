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

    // For now, we'll let the RoleGuard component handle role-based access
    // In a production environment, you might want to check roles here as well
    console.log("Admin route accessed by:", req.auth.user?.email);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
