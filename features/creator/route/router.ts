import { z } from "zod";
import { router, protectedProcedure } from "@/trpc/init";
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

  updateSettings: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().uuid(),
        isTtsEnabled: z.boolean().optional(),
        ttsMinAmount: z.number().min(0).optional(),
        isMediaShareEnabled: z.boolean().optional(),
        mediaShareCostPerSecond: z.number().min(1000).optional(),
        mediaShareMaxDuration: z.number().max(180).optional(),
        overlaySettings: z.object({
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          borderColor: z.string().optional(),
          volume: z.number().min(0).max(100).optional(),
          animationType: z.enum(["fade", "slide", "bounce"]).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Verify ownership
      const existingCreator = await db.query.creator.findFirst({
        where: eq(creator.id, input.creatorId),
      });

      if (!existingCreator || existingCreator.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this profile.",
        });
      }

      // 2. Update
      const updateData: any = {
        isTtsEnabled: input.isTtsEnabled,
        ttsMinAmount: input.ttsMinAmount,
        isMediaShareEnabled: input.isMediaShareEnabled,
        mediaShareCostPerSecond: input.mediaShareCostPerSecond,
        mediaShareMaxDuration: input.mediaShareMaxDuration,
      };

      if (input.overlaySettings) {
        updateData.overlaySettings = input.overlaySettings;
      }

      // Filter out undefined values to avoid overwriting with null/default
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const [updatedCreator] = await db
        .update(creator)
        .set(updateData)
        .where(eq(creator.id, input.creatorId))
        .returning();

      return updatedCreator;
    }),
});
