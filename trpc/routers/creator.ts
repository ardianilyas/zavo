import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/db";
import { creator } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const creatorRouter = router({
  myProfiles: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.creator.findMany({
      where: eq(creator.userId, ctx.session.user.id),
      orderBy: (creators, { desc }) => [desc(creators.createdAt)]
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
        name: z.string().min(1),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Limit to 2 profiles
      const existingProfiles = await db.select({ count: count() })
        .from(creator)
        .where(eq(creator.userId, ctx.session.user.id));

      if (existingProfiles[0].count >= 2) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only create up to 2 profiles."
        });
      }

      // 2. Check username uniqueness
      const existingUsername = await db.query.creator.findFirst({
        where: eq(creator.username, input.username)
      });

      if (existingUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken."
        });
      }

      // 3. Create Profile
      const [newProfile] = await db.insert(creator).values({
        userId: ctx.session.user.id,
        username: input.username,
        name: input.name,
        bio: input.bio,
        streamToken: crypto.randomUUID().replace(/-/g, ""), // Generate random stream token
        balance: 0,
      }).returning();

      return newProfile;
    }),
});
