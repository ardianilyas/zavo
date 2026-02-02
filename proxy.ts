import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  strictRateLimiter,
  moderateRateLimiter,
  generousRateLimiter,
  applyRateLimit,
} from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for static files, _next, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  let rateLimitResponse: Response | null = null;

  // Apply strict rate limiting to auth and webhook endpoints
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/webhooks")) {
    rateLimitResponse = await applyRateLimit(request, strictRateLimiter);
  }
  // Apply moderate rate limiting to tRPC endpoints
  else if (pathname.startsWith("/api/trpc")) {
    rateLimitResponse = await applyRateLimit(request, moderateRateLimiter);
  }
  // Apply generous rate limiting to public donation pages
  else if (pathname.match(/^\/[^\/]+\/?$/)) {
    // Matches routes like /username or /username/
    rateLimitResponse = await applyRateLimit(request, generousRateLimiter);
  }

  // If rate limited, return the rate limit response
  if (rateLimitResponse) {
    // Check if the request is for an API endpoint or expects JSON
    const isApiRequest = pathname.startsWith("/api") || pathname.startsWith("/trpc");
    const acceptsJson = request.headers.get("accept")?.includes("application/json");

    // If it's an API request or expects JSON, return the JSON error
    if (isApiRequest || acceptsJson) {
      return rateLimitResponse;
    }

    // Otherwise, redirect to the custom 429 page
    const url = request.nextUrl.clone();
    url.pathname = "/too-many-requests";
    return NextResponse.redirect(url);
  }

  // Validate session properly (not just cookie presence)
  let session = null;
  let isAuthenticated = false;

  const sessionCookie = request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (sessionCookie) {
    try {
      const { auth } = await import("@/lib/auth");
      session = await auth.api.getSession({
        headers: request.headers
      });
      isAuthenticated = !!session?.user;
    } catch (error) {
      console.error("Session validation failed:", error);
      isAuthenticated = false;
    }
  }

  // Define protected routes and auth routes
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin Role Check (session already validated above)
  if (isAdminRoute && isAuthenticated) {
    if (!session?.user || (session.user as any).role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users trying to access auth routes
  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Ban/Suspension check
  if (isAuthenticated && session?.user) {
    const user = session.user as any;
    const isBanned = user.banned === true;
    const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();

    if (isBanned || isSuspended) {
      if (pathname !== "/banned" && !pathname.startsWith("/api/auth")) {
        const url = request.nextUrl.clone();
        url.pathname = "/banned";
        return NextResponse.redirect(url);
      }
    } else {
      // Prevent non-banned users from staying on the /banned page
      if (pathname === "/banned") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
