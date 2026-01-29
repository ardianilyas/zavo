import { db } from "@/db";
import { creator, donation } from "@/db/schema";
import { eq, sum, count, and, gte, sql } from "drizzle-orm";
import { subMonths, format, eachDayOfInterval } from "date-fns";

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

  static async getRevenueChartData(creatorId: string) {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);

    // Group donations by date (created_at::date) and sum amount
    const dbData = await db
      .select({
        date: sql<string>`to_char(${donation.createdAt}, 'YYYY-MM-DD')`,
        total: sum(donation.amount),
      })
      .from(donation)
      .where(
        and(
          eq(donation.recipientId, creatorId),
          eq(donation.status, "PAID"),
          gte(donation.createdAt, threeMonthsAgo)
        )
      )
      .groupBy(sql`to_char(${donation.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${donation.createdAt}, 'YYYY-MM-DD')`);

    // Create a map for quick lookup
    const revenueMap = new Map(
      dbData.map((item) => [item.date, Number(item.total || 0)])
    );

    // Generate all dates in the interval
    const allDays = eachDayOfInterval({
      start: threeMonthsAgo,
      end: today,
    });

    // Merge dates with DB data
    return allDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        date: dateStr,
        revenue: revenueMap.get(dateStr) || 0,
      };
    });
  }
}

