
import { db } from "@/db";
import { donationGoal, creator } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { EventService } from "@/lib/events";

export class GoalService {
  static async updateProgress(creatorId: string, amount: number) {
    // 1. Find Active Goal
    const activeGoal = await db.query.donationGoal.findFirst({
      where: and(
        eq(donationGoal.creatorId, creatorId),
        eq(donationGoal.status, "ACTIVE")
      ),
      orderBy: [desc(donationGoal.createdAt)]
    });

    if (!activeGoal) return;

    // 2. Update Amount
    const newAmount = activeGoal.currentAmount + amount;

    // Check if goal is reached? We don't automatically stop it, usually. Even if > 100%.

    const [updated] = await db
      .update(donationGoal)
      .set({
        currentAmount: newAmount,
        updatedAt: new Date()
      })
      .where(eq(donationGoal.id, activeGoal.id))
      .returning();

    // 3. Trigger Event
    const creatorProfile = await db.query.creator.findFirst({
      where: eq(creator.id, creatorId),
      columns: { username: true }
    });

    if (creatorProfile && creatorProfile.username) {
      await EventService.triggerGoalUpdate(creatorProfile.username, {
        id: updated.id,
        title: activeGoal.title,
        targetAmount: activeGoal.targetAmount,
        currentAmount: updated.currentAmount,
        status: activeGoal.status as "ACTIVE" | "COMPLETED" | "CANCELLED",
        percentage: Math.min(100, (updated.currentAmount / activeGoal.targetAmount) * 100)
      });
    }
  }
}
