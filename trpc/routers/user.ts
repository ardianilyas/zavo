import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../init";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

export const userRouter = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username must be at most 20 characters")
          .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        bio: z.string().max(160).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if username is already taken (by someone else)
      if (input.username) {
        const existingUser = await db.query.user.findFirst({
          where: eq(user.username, input.username),
        });

        if (existingUser && existingUser.id !== ctx.session?.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username is already taken",
          });
        }
      }

      // Generate a unique stream token if not exists
      let streamToken = ctx.session?.user.streamToken;
      if (!streamToken) {
        streamToken = randomBytes(16).toString("hex");
      }

      await db
        .update(user)
        .set({
          username: input.username,
          bio: input.bio,
          streamToken: streamToken,
        })
        .where(eq(user.id, ctx.session?.user.id));

      return { success: true };
    }),

  regenerateStreamToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      const newToken = randomBytes(16).toString("hex");

      await db
        .update(user)
        .set({ streamToken: newToken })
        .where(eq(user.id, ctx.session?.user.id));

      return { streamToken: newToken };
    }),
});
