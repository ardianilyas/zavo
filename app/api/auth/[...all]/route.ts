
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { strictRateLimiter, applyRateLimit } from "@/lib/rate-limit";

const authHandler = toNextJsHandler(auth);

// Wrap auth handlers with rate limiting
const createRateLimitedHandler = (handler: any) => async (req: Request) => {
  // Apply strict rate limiting to auth endpoints
  const rateLimitResponse = await applyRateLimit(req, strictRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return handler(req);
};

export const POST = createRateLimitedHandler(authHandler.POST);
export const GET = createRateLimitedHandler(authHandler.GET);
