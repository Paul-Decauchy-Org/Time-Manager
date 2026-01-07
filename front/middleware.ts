// middleware.ts - Simple cookie existence check
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if cookie exists
  const hasAccessToken = request.cookies.has("token");
  //TODO: refresh token

  // const hasRefreshToken = request.cookies.has('refreshToken');

  // Get cookie value (returns undefined if not exists)
  const accessToken = request.cookies.get("token")?.value;
  // const refreshToken = request.cookies.get('refreshToken');

  console.log("Has access token:", hasAccessToken);
  console.log("Access token value:", accessToken);

  const pathname = request.nextUrl.pathname;

  // Protect authenticated routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin")
  ) {
    if (!hasAccessToken) {
      // No cookie - redirect to login
      console.log("No access token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Cookie exists - allow access
    // Note: This doesn't verify if token is valid, just that it exists
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (hasAccessToken) {
      // Already logged in - redirect to dashboard
      console.log("Already logged in, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Allow access to home page for everyone
  if (pathname === "/") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/",
  ],
};
