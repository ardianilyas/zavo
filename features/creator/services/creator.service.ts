import { db } from "@/db";
import { creator, donation, ledgerTransaction } from "@/db/schema";
import { eq, sum, count, and, gte, sql, lte, desc } from "drizzle-orm";
import { subMonths, format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

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
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const startOfLastMonth = startOfMonth(subMonths(today, 1));
    const endOfLastMonth = endOfMonth(subMonths(today, 1));

    // 1. All-time Donation Stats
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

    // 2. Current Month Donations
    const currentMonthDonationsRes = await db
      .select({ total: sum(donation.amount) })
      .from(donation)
      .where(
        and(
          eq(donation.recipientId, creatorId),
          eq(donation.status, "PAID"),
          gte(donation.createdAt, startOfCurrentMonth)
        )
      );
    const currentMonthDonations = Number(currentMonthDonationsRes[0]?.total || 0);

    // 3. Last Month Donations
    const lastMonthDonationsRes = await db
      .select({ total: sum(donation.amount) })
      .from(donation)
      .where(
        and(
          eq(donation.recipientId, creatorId),
          eq(donation.status, "PAID"),
          gte(donation.createdAt, startOfLastMonth),
          lte(donation.createdAt, endOfLastMonth)
        )
      );
    const lastMonthDonations = Number(lastMonthDonationsRes[0]?.total || 0);

    // 4. Current Month Withdrawals (Ledger DEBIT + referenceType WITHDRAWAL)
    // Note: Assuming 'WITHDRAWAL' is the correct referenceType based on schema
    const currentMonthWithdrawalsRes = await db
      .select({ total: sum(ledgerTransaction.amount) })
      .from(ledgerTransaction)
      .where(
        and(
          eq(ledgerTransaction.creatorId, creatorId),
          eq(ledgerTransaction.type, "DEBIT"),
          eq(ledgerTransaction.referenceType, "WITHDRAWAL"),
          gte(ledgerTransaction.createdAt, startOfCurrentMonth)
        )
      );
    const currentMonthWithdrawals = Number(currentMonthWithdrawalsRes[0]?.total || 0);

    // 5. Last Month Withdrawals
    const lastMonthWithdrawalsRes = await db
      .select({ total: sum(ledgerTransaction.amount) })
      .from(ledgerTransaction)
      .where(
        and(
          eq(ledgerTransaction.creatorId, creatorId),
          eq(ledgerTransaction.type, "DEBIT"),
          eq(ledgerTransaction.referenceType, "WITHDRAWAL"),
          gte(ledgerTransaction.createdAt, startOfLastMonth),
          lte(ledgerTransaction.createdAt, endOfLastMonth)
        )
      );
    const lastMonthWithdrawals = Number(lastMonthWithdrawalsRes[0]?.total || 0);

    // Calculate Growth
    const donationGrowth = lastMonthDonations === 0
      ? (currentMonthDonations > 0 ? 100 : 0)
      : ((currentMonthDonations - lastMonthDonations) / lastMonthDonations) * 100;

    const withdrawalGrowth = lastMonthWithdrawals === 0
      ? (currentMonthWithdrawals > 0 ? 100 : 0)
      : ((currentMonthWithdrawals - lastMonthWithdrawals) / lastMonthWithdrawals) * 100;

    return {
      totalDonations,
      donationCount,
      currentMonthDonations,
      donationGrowth,
      currentMonthWithdrawals,
      withdrawalGrowth
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


  static async getRecentDonations(creatorId: string, limit: number = 10) {
    return await db.query.donation.findMany({
      where: and(
        eq(donation.recipientId, creatorId),
        eq(donation.status, "PAID")
      ),
      orderBy: (donations, { desc }) =>  [desc(donations.createdAt)],
      limit,
    });
  }
}
