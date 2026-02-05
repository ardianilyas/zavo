import { db } from "@/db";
import { user, donation, creator, platformRevenue, withdrawalRequest } from "@/db/schema";
import { count, sum, eq, and, or, gte, lte, sql, inArray, isNull } from "drizzle-orm";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, format } from "date-fns";

export class AdminService {
  static async getAnalytics() {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentYearStart = startOfYear(now);
    const currentYearEnd = endOfYear(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const thirtyDaysAgo = subDays(now, 30);

    // Sequential data fetching to avoid connection pool exhaustion
    const [usersCount] = await db.select({ count: count() }).from(user);
    const [creatorsCount] = await db.select({ count: count() }).from(creator);

    // --- Gross Volume (Donations) ---
    const [totalRevenueYear] = await db.select({ sum: sum(donation.amount) })
      .from(donation)
      .where(and(
        eq(donation.status, "PAID"),
        gte(donation.createdAt, currentYearStart),
        lte(donation.createdAt, currentYearEnd)
      ));

    const [totalRevenueMonth] = await db.select({ sum: sum(donation.amount) })
      .from(donation)
      .where(and(
        eq(donation.status, "PAID"),
        gte(donation.createdAt, currentMonthStart),
        lte(donation.createdAt, currentMonthEnd)
      ));

    const [totalRevenueLastMonth] = await db.select({ sum: sum(donation.amount) })
      .from(donation)
      .where(and(
        eq(donation.status, "PAID"),
        gte(donation.createdAt, lastMonthStart),
        lte(donation.createdAt, lastMonthEnd)
      ));

    // --- Net Revenue (Platform Fees) ---
    const [netRevenueTotalRes] = await db.select({ sum: sum(platformRevenue.amount) })
      .from(platformRevenue);

    const [netRevenueYearRes] = await db.select({ sum: sum(platformRevenue.amount) })
      .from(platformRevenue)
      .where(and(
        gte(platformRevenue.createdAt, currentYearStart),
        lte(platformRevenue.createdAt, currentYearEnd)
      ));

    const [netRevenueMonthRes] = await db.select({ sum: sum(platformRevenue.amount) })
      .from(platformRevenue)
      .where(and(
        gte(platformRevenue.createdAt, currentMonthStart),
        lte(platformRevenue.createdAt, currentMonthEnd)
      ));

    // --- Platform Fee Specific (5% Profit) ---
    const [platformFeeMonthRes] = await db.select({ sum: sum(platformRevenue.amount) })
      .from(platformRevenue)
      .where(and(
        eq(platformRevenue.type, "PLATFORM_FEE"),
        gte(platformRevenue.createdAt, currentMonthStart),
        lte(platformRevenue.createdAt, currentMonthEnd)
      ));

    // --- Payouts (Withdrawals) ---
    const [totalPayoutsMonthRes] = await db.select({ sum: sum(withdrawalRequest.amount) })
      .from(withdrawalRequest)
      .where(and(
        eq(withdrawalRequest.status, "COMPLETED"),
        gte(withdrawalRequest.createdAt, currentMonthStart),
        lte(withdrawalRequest.createdAt, currentMonthEnd)
      ));

    // Calculate Implied Fee (Assuming 5% fee was taken)
    // withdrawalRequest.amount is GROSS (before fee deduction)
    const payoutAmount = Number(totalPayoutsMonthRes?.sum || 0);
    const impliedFee = payoutAmount * 0.05;

    // --- Donations Count ---
    const [totalDonationsYear] = await db.select({ count: count() })
      .from(donation)
      .where(and(
        eq(donation.status, "PAID"),
        gte(donation.createdAt, currentYearStart),
        lte(donation.createdAt, currentYearEnd)
      ));

    const [totalDonationsMonth] = await db.select({ count: count() })
      .from(donation)
      .where(and(
        eq(donation.status, "PAID"),
        gte(donation.createdAt, currentMonthStart),
        lte(donation.createdAt, currentMonthEnd)
      ));

    // --- Liability (Creator Balances) ---
    const [totalLiability] = await db.select({ sum: sum(creator.balance) }).from(creator);

    // --- Chart Data (Last 30 Days) ---
    // 1. Daily Gross Volume
    const dailyVolume = await db.select({
      date: sql<string>`DATE(${donation.createdAt})`,
      amount: sum(donation.amount)
    })
      .from(donation)
      .where(and(
        eq(donation.status, "PAID"),
        gte(donation.createdAt, thirtyDaysAgo)
      ))
      .groupBy(sql`DATE(${donation.createdAt})`);

    // 2. Daily Net Revenue
    const dailyNet = await db.select({
      date: sql<string>`DATE(${platformRevenue.createdAt})`,
      amount: sum(platformRevenue.amount)
    })
      .from(platformRevenue)
      .where(gte(platformRevenue.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${platformRevenue.createdAt})`);

    // Merge for Chart
    const chartMap = new Map<string, { date: string, gross: number, net: number }>();

    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
      const d = subDays(now, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      chartMap.set(dateStr, { date: dateStr, gross: 0, net: 0 });
    }

    dailyVolume.forEach((item) => {
      // Postgres DATE returns string YYYY-MM-DD
      const d = new Date(item.date).toISOString().split('T')[0];
      if (chartMap.has(d)) {
        chartMap.get(d)!.gross = Number(item.amount);
      }
    });

    dailyNet.forEach((item) => {
      const d = new Date(item.date).toISOString().split('T')[0];
      if (chartMap.has(d)) {
        chartMap.get(d)!.net = Number(item.amount);
      }
    });

    const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));


    // --- Growth Calculation ---
    const currentMonthSum = Number(totalRevenueMonth?.sum || 0);
    const lastMonthSum = Number(totalRevenueLastMonth?.sum || 0);

    let growthPercentage = 0;
    if (lastMonthSum > 0) {
      growthPercentage = ((currentMonthSum - lastMonthSum) / lastMonthSum) * 100;
    } else if (currentMonthSum > 0) {
      growthPercentage = 100;
    }

    return {
      users: usersCount?.count || 0,
      creators: creatorsCount?.count || 0,
      liability: Number(totalLiability?.sum || 0),
      revenue: { // Gross Volume
        year: Number(totalRevenueYear?.sum || 0),
        month: currentMonthSum,
        growth: growthPercentage.toFixed(1)
      },
      netRevenue: {
        total: Number(netRevenueTotalRes?.sum || 0),
        year: Number(netRevenueYearRes?.sum || 0),
        month: Number(netRevenueMonthRes?.sum || 0),
        platformFeeMonth: Number(platformFeeMonthRes?.sum || 0)
      },
      payouts: {
        month: payoutAmount,
        impliedFeeMonth: impliedFee
      },
      donations: {
        year: totalDonationsYear?.count || 0,
        month: totalDonationsMonth?.count || 0
      },
      chart: chartData
    };
  }

  // --- User Management ---

  static async getUsers(params: { page: number; limit: number; search?: string; status?: "all" | "active" | "suspended" | "banned"; role?: "all" | "creator" }) {
    const limit = params.limit || 20;
    const offset = (params.page - 1) * limit;
    const status = params.status || "all";

    const conditions = [];

    // Search Filter
    if (params.search) {
      conditions.push(sql`${user.name} ILIKE ${`%${params.search}%`} OR ${user.email} ILIKE ${`%${params.search}%`}`);
    }

    // Role Filter (Creator)
    if (params.role === "creator") {
      // This assumes there is a relation or we check existence.
      // Since we are already querying the user table, we can use an EXISTS clause or simple Join if supported by the ORM helpers used here.
      // However, looking at the code structure, we are building a `where` clause for the `user` table.
      // If `creator` table has `userId`, we can filter users who are in the creator table.
      // Drizzle `inArray` with a subquery is a good approach.
      conditions.push(sql`EXISTS (SELECT 1 FROM ${creator} WHERE ${creator.userId} = ${user.id})`);
    }

    // Status Filter
    const now = new Date();
    if (status === "active") {
      conditions.push(and(eq(user.banned, false), or(isNull(user.suspendedUntil), lte(user.suspendedUntil, now))));
    } else if (status === "suspended") {
      conditions.push(and(eq(user.banned, false), gte(user.suspendedUntil, now)));
    } else if (status === "banned") {
      conditions.push(eq(user.banned, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Fetch Users first (to get correct pagination without duplicates)
    const [users, total] = await Promise.all([
      db.select()
        .from(user)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${user.createdAt} DESC`),

      db.select({ count: count() })
        .from(user)
        .where(whereClause)
        .then(res => res[0]?.count || 0)
    ]);

    // 2. Fetch Creator profiles for these users
    const userIds = users.map(u => u.id);
    let creators: any[] = [];

    if (userIds.length > 0) {
      // use custom 'inArray' or simple ORs if drizzle version is issues, but inArray is standard
      // Importing inArray might be needed.
      // For now, simpler workaround if inArray import is missing:
      // Use Promise.all if list is small? No, better to do one query.
      // Attempting to use db.query if available or standard Select.

      // Actually, let's just query associated creators.
      // We will fetch ALL creators for these users.
      const creatorResults = await db.select({
        id: creator.id,
        userId: creator.userId,
        username: creator.username
      }).from(creator)
        .where(sql`${creator.userId} IN ${userIds}`); // SQL templating handles the array safely usually? No.

      creators = creatorResults;
    }

    // 3. Merge
    const usersWithCreator = users.map(u => {
      const foundCreator = creators.find(c => c.userId === u.id);
      return {
        ...u,
        creator: foundCreator ? { id: foundCreator.id, username: foundCreator.username } : null
      };
    });

    return {
      users: usersWithCreator,
      total,
      page: params.page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async banUser(userId: string, reason: string, durationInDays?: number) {
    if (durationInDays) {
      // Temporary Suspension
      const suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + durationInDays);

      await db.update(user)
        .set({
          banned: false, // Ensure not permanently banned
          banReason: reason,
          suspendedUntil: suspendedUntil
        })
        .where(eq(user.id, userId));
    } else {
      // Permanent Ban
      await db.update(user)
        .set({
          banned: true,
          banReason: reason,
          suspendedUntil: null // Clear suspension if moving to permanent ban
        })
        .where(eq(user.id, userId));
    }
  }

  static async unbanUser(userId: string) {
    await db.update(user)
      .set({ banned: false, banReason: null, suspendedUntil: null })
      .where(eq(user.id, userId));
  }
}
