import { db } from "@/db";
import { creator, donation } from "@/db/schema";
import { eq, sum, count, and } from "drizzle-orm";

export class CreatorService {
  static async getProfileByUserId(userId: string) {
    return await db.query.creator.findFirst({
      where: eq(creator.userId, userId)
    });
  }

  static async getAllProfilesByUserId(userId: string) {
    return await db.query.creator.findMany({
      where: eq(creator.userId, userId)
    });
  }

  static async getProfileById(id: string, userId: string) {
    return await db.query.creator.findFirst({
      where: (creators, { eq, and }) => and(
        eq(creators.id, id),
        eq(creators.userId, userId)
      )
    });
  }

  static async getProfileByUsername(username: string) {
    return await db.query.creator.findFirst({
      where: eq(creator.username, username)
    });
  }

  static async getProfileByStreamToken(token: string) {
    return await db.query.creator.findFirst({
      where: eq(creator.streamToken, token)
    });
  }

  static async getStats(creatorId: string) {
    // Calculate total donations and count
    const donationStats = await db
      .select({
        totalAmount: sum(donation.amount),
        count: count(donation.id),
      })
      .from(donation)
      .where(
        and(
          eq(donation.recipientId, creatorId),
          eq(donation.status, "PAID")
        )
      );

    const totalDonations = donationStats[0]?.totalAmount ? Number(donationStats[0].totalAmount) : 0;
    const donationCount = donationStats[0]?.count ? Number(donationStats[0].count) : 0;

    return {
      totalDonations,
      donationCount,
      // Placeholder for other stats until schema supports them
      activeMembers: 0,
      newFollowers: 0
    };
  }
}

