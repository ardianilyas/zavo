import { NextResponse } from "next/server";
import { strictRateLimiter, applyRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Always apply strict rate limit (10 req/10s) to this endpoint for testing
  const rateLimitResponse = await applyRateLimit(request, strictRateLimiter);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return NextResponse.json({
    message: "Request successful",
    timestamp: new Date().toISOString(),
    note: "Refresh this page rapidly to test rate limiting (Strict: 10 req/10s)",
  });
}
