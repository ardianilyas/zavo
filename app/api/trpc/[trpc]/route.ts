
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/root";
import { moderateRateLimiter, applyRateLimit } from "@/lib/rate-limit";

const handler = async (req: Request) => {
  // Apply rate limiting (additional layer to middleware)
  const rateLimitResponse = await applyRateLimit(req, moderateRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
