import { db } from "@/db";
import { user, donation } from "@/db/schema";
import { count, sum, eq, and, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";

export class AdminService {
  static async getAnalytics() {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentYearStart = startOfYear(now);
    const currentYearEnd = endOfYear(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Sequential data fetching to avoid connection pool exhaustion (Error 53300)
    const [usersCount] = await db.select({ count: count() }).from(user);

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
      revenue: {
        year: Number(totalRevenueYear?.sum || 0),
        month: currentMonthSum,
        growth: growthPercentage.toFixed(1)
      },
      donations: {
        year: totalDonationsYear?.count || 0,
        month: totalDonationsMonth?.count || 0
      }
    };
  }
}
