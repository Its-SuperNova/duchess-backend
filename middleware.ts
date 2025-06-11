import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any middleware logic here if needed
    console.log("Middleware called for:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow all requests for now to test redirect
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Temporarily disable all matchers to test redirect
    // "/profile/:path*",
    // "/admin/:path*",
  ],
};
