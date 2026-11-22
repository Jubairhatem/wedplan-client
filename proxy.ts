import { NextRequest, NextResponse } from "next/server";

// Route prefixes that always require an authenticated session
const protectedPrefixes = ["/dashboard", "/payment"];
const authRoutes = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth stores the session token in a cookie
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthenticated = !!sessionCookie?.value;

  // The browse page (/services) is public, but a single service detail
  // (/services/:id) requires sign-in so the booking flow can start there.
  const isServiceDetail =
    pathname.startsWith("/services/") && pathname !== "/services/";

  const isProtectedRoute =
    protectedPrefixes.some((route) => pathname.startsWith(route)) ||
    isServiceDetail;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 2. Authenticated users trying to access sign-in / sign-up
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payment/:path*",
    "/services/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
