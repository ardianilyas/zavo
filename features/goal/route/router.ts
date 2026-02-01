
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@/trpc/init";
import { db } from "@/db";
import { donationGoal, creator } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { EventService } from "@/lib/events";

export const goalRouter = router({
  create: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      title: z.string().min(1, "Title is required").max(100),
      targetAmount: z.number().min(10000, "Minimum target is Rp 10.000"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const targetCreator = await db.query.creator.findFirst({
        where: (c, { eq, and }) => and(eq(c.id, input.creatorId), eq(c.userId, ctx.session.user.id))
      });

      if (!targetCreator) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Creator profile not found" });
      }

      // Stop any currently active goals
      await db
        .update(donationGoal)
        .set({ status: "CANCELLED", endDate: new Date() })
        .where(
          and(
            eq(donationGoal.creatorId, input.creatorId),
            eq(donationGoal.status, "ACTIVE")
          )
        );

      // Create new goal
      const newGoal = await db
        .insert(donationGoal)
        .values({
          creatorId: input.creatorId,
          title: input.title,
          targetAmount: input.targetAmount,
          currentAmount: 0,
          status: "ACTIVE",
          startDate: new Date(),
        })
        .returning();

      // Trigger event for overlay update
      if (targetCreator.username) {
        await EventService.triggerGoalUpdate(targetCreator.username, {
          id: newGoal[0].id,
          title: newGoal[0].title,
          targetAmount: newGoal[0].targetAmount,
          currentAmount: newGoal[0].currentAmount,
          status: "ACTIVE",
          percentage: 0
        });
      }

      return newGoal[0];
    }),

  stop: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      reason: z.enum(["COMPLETED", "CANCELLED"]).default("CANCELLED")
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const targetCreator = await db.query.creator.findFirst({
        where: (c, { eq, and }) => and(eq(c.id, input.creatorId), eq(c.userId, ctx.session.user.id))
      });

      if (!targetCreator) throw new TRPCError({ code: "UNAUTHORIZED" });

      const updated = await db
        .update(donationGoal)
        .set({ status: input.reason, endDate: new Date() })
        .where(
          and(
            eq(donationGoal.creatorId, input.creatorId),
            eq(donationGoal.status, "ACTIVE")
          )
        )
        .returning();

      if (targetCreator.username && updated.length > 0) {
        await EventService.triggerGoalUpdate(targetCreator.username, {
          id: updated[0].id,
          title: updated[0].title,
          targetAmount: updated[0].targetAmount,
          currentAmount: updated[0].currentAmount,
          status: input.reason,
          percentage: Math.min(100, (updated[0].currentAmount / updated[0].targetAmount) * 100)
        });
      }

      return { success: true };
    }),

  getActive: publicProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const activeGoal = await db.query.donationGoal.findFirst({
        where: and(
          eq(donationGoal.creatorId, input.creatorId),
          eq(donationGoal.status, "ACTIVE")
        ),
        orderBy: [desc(donationGoal.createdAt)]
      });

      return activeGoal || null;
    }),
});
