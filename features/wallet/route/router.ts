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

        const [req] = await tx.insert(withdrawalRequest).values({
          creatorId: input.creatorId,
          amount: input.amount,
          bankCode: input.bankCode,
          accountNumber: input.accountNumber,
          accountName: input.accountName,
          notes: input.notes,
        }).returning();

        await WalletService.recordMovement(tx, {
          creatorId: input.creatorId,
          amount: input.amount,
          type: "DEBIT",
          description: `Withdrawal Request (${req.id})`,
          referenceId: req.id,
          referenceType: "WITHDRAWAL",
        });

        return req;
      });

      // 2. Trigger Xendit Disbursement
      try {
        const disbursement = await XenditService.createDisbursement({
          externalId: request.id,
          amount: request.amount,
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
        await db.transaction(async (tx) => {
          // Refund Balance
          await WalletService.recordMovement(tx, {
            creatorId: input.creatorId,
            amount: input.amount,
            type: "CREDIT",
            description: `Refund: Failed Withdrawal (${request.id})`,
            referenceId: request.id,
            referenceType: "ADJUSTMENT",
          });

          // Mark as Failed
          await tx.update(withdrawalRequest)
            .set({ status: "REJECTED", adminNotes: "Xendit API Error: " + error.message })
            .where(eq(withdrawalRequest.id, request.id));
        });

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
});
