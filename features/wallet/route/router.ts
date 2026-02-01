import { z } from "zod";
import { router, protectedProcedure } from "@/trpc/init";
import { withdrawalRequest, creator, ledgerTransaction } from "@/db/schema";
import { WalletService } from "@/features/wallet/services/wallet.service";
import { createWithdrawalSchema } from "@/features/wallet/schema/wallet.schema";
import { TRPCError } from "@trpc/server";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { XenditService } from "@/lib/xendit-service";

export const payoutRouter = router({
  // Request a new withdrawal
  request: protectedProcedure
    .input(createWithdrawalSchema.extend({ creatorId: z.string() }))
    .mutation(async ({ input, ctx }: { input: any, ctx: any }) => {
      // 1. Create Withdrawal Request in DB (Atomic Balance Deduct)
      const request = await db.transaction(async (tx) => {
        // Verify creator (omitted for brevity, assume same logic as before)
        const targetCreator = await tx.query.creator.findFirst({
          where: (creators, { eq, and }) => and(
            eq(creators.id, input.creatorId),
            eq(creators.userId, ctx.session.user.id)
          )
        });

        if (!targetCreator) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
        }

        if (targetCreator.balance < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        // Check for Locked Funds (Pending Withdrawals)
        const pendingRequests = await tx.query.withdrawalRequest.findMany({
          where: (req, { eq, or, and }) => and(
            eq(req.creatorId, input.creatorId),
            or(eq(req.status, "PENDING"), eq(req.status, "PROCESSING"))
          )
        });

        const lockedAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
        const availableBalance = targetCreator.balance - lockedAmount;

        if (availableBalance < input.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient available balance. You have ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(lockedAmount)} locked in pending withdrawals.`
          });
        }

        const [req] = await tx.insert(withdrawalRequest).values({
          creatorId: input.creatorId,
          amount: input.amount,
          bankCode: input.bankCode,
          accountNumber: input.accountNumber,
          accountName: input.accountName,
          notes: input.notes,
        }).returning();

        // Save bank details to profile if requested
        if (input.saveDetails) {
          const hasDetailsChanged =
            targetCreator.bankCode !== input.bankCode ||
            targetCreator.accountNumber !== input.accountNumber ||
            targetCreator.accountName !== input.accountName;

          if (hasDetailsChanged) {
            const now = new Date();
            const lastUpdated = targetCreator.bankDetailsUpdatedAt;

            if (lastUpdated) {
              const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              if (lastUpdated > thirtyDaysAgo) {
                const nextUpdateDate = new Date(lastUpdated.getTime() + 30 * 24 * 60 * 60 * 1000);
                throw new TRPCError({
                  code: "FORBIDDEN",
                  message: `Bank details can only be updated once every 30 days. Next update allowed: ${nextUpdateDate.toLocaleDateString("id-ID")}`
                });
              }
            }

            await tx.update(creator)
              .set({
                bankCode: input.bankCode,
                accountNumber: input.accountNumber,
                accountName: input.accountName,
                bankDetailsUpdatedAt: new Date(),
              })
              .where(eq(creator.id, input.creatorId));
          }
        }

        // NOTE: We do NOT debit here anymore. Debit happens on Webhook Success.


        return req;
      });

      // 2. Trigger Xendit Disbursement
      try {
        const adminFee = 5000;
        const platformFee = Math.floor(request.amount * 0.05);
        const netPayout = request.amount - adminFee - platformFee;

        const disbursement = await XenditService.createDisbursement({
          externalId: request.id,
          amount: netPayout,
          bankCode: request.bankCode,
          accountHolderName: request.accountName,
          accountNumber: request.accountNumber,
          description: `Payout for ${ctx.session.user.name}`,
        });

        // 3. Update Request with Xendit ID
        await db.update(withdrawalRequest)
          .set({
            xenditId: disbursement.id,
            status: "PROCESSING"
          })
          .where(eq(withdrawalRequest.id, request.id));

        return { ...request, status: "PROCESSING" };
      } catch (error: any) {
        console.error("Disbursement Failed:", error);

        // 4. Rollback / Refund if Xendit call fails
        // 4. Update Status to REJECTED (No Refund needed as we didn't debit)
        await db.update(withdrawalRequest)
          .set({ status: "REJECTED", adminNotes: "Xendit API Error: " + error.message })
          .where(eq(withdrawalRequest.id, request.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process payout with Xendit. Funds have been returned."
        });
      }
    }),

  // Get history for a specific creator
  getHistory: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      limit: z.number().optional(),
      page: z.number().min(1).optional().default(1),
      type: z.enum(["CREDIT", "DEBIT"]).optional(),
      referenceType: z.enum(["DONATION", "WITHDRAWAL", "ADJUSTMENT"]).optional()
    }))
    .query(async ({ input, ctx }: { input: { creatorId: string, limit?: number, page: number, type?: "CREDIT" | "DEBIT", referenceType?: "DONATION" | "WITHDRAWAL" | "ADJUSTMENT" }, ctx: any }) => {
      // Verify ownership
      const targetCreator = await db.query.creator.findFirst({
        where: (c, { eq, and }) => and(eq(c.id, input.creatorId), eq(c.userId, ctx.session.user.id))
      });
      if (!targetCreator) throw new TRPCError({ code: "UNAUTHORIZED" });

      const limit = input.limit || 50;
      const offset = (input.page - 1) * limit;

      const filters = [eq(ledgerTransaction.creatorId, input.creatorId)];
      if (input.type) filters.push(eq(ledgerTransaction.type, input.type));
      if (input.referenceType) filters.push(eq(ledgerTransaction.referenceType, input.referenceType));

      const [history, total] = await Promise.all([
        db.query.ledgerTransaction.findMany({
          where: (t, { and }) => and(...filters),
          orderBy: [desc(ledgerTransaction.createdAt)],
          limit: limit,
          offset: offset,
        }),
        db
          .select({ count: sql<number>`count(*)` })
          .from(ledgerTransaction)
          .where(and(...filters))
          .then((res) => Number(res[0]?.count || 0)),
      ]);

      return {
        items: history,
        total,
        page: input.page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get Withdrawal Requests (More detailed than ledger)
  getWithdrawals: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      limit: z.number().optional(),
      page: z.number().min(1).optional().default(1),
    }))
    .query(async ({ input, ctx }: { input: { creatorId: string, limit?: number, page: number }, ctx: any }) => {
      // Verify ownership
      const targetCreator = await db.query.creator.findFirst({
        where: (c, { eq, and }) => and(eq(c.id, input.creatorId), eq(c.userId, ctx.session.user.id))
      });
      if (!targetCreator) throw new TRPCError({ code: "UNAUTHORIZED" });

      const limit = input.limit || 50;
      const offset = (input.page - 1) * limit;

      const [items, total] = await Promise.all([
        db.query.withdrawalRequest.findMany({
          where: eq(withdrawalRequest.creatorId, input.creatorId),
          orderBy: [desc(withdrawalRequest.createdAt)],
          limit: limit,
          offset: offset,
        }),
        db
          .select({ count: sql<number>`count(*)` })
          .from(withdrawalRequest)
          .where(eq(withdrawalRequest.creatorId, input.creatorId))
          .then((res) => Number(res[0]?.count || 0)),
      ]);

      return {
        items,
        total,
        page: input.page,
        totalPages: Math.ceil(total / limit),
      };
    }),
});
