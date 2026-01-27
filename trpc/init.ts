
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const createTRPCContext = cache(async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList
  });
  return {
    session,
    headers: headersList
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

export const createCallerFactory = t.createCallerFactory;
