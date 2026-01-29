import { db } from "@/db";
import { creator, ledgerTransaction, paymentLog } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export class WalletService {
  /**
   * Records a credit (inflow) or debit (outflow) with high integrity.
   * This should always be used inside a transaction if part of a larger operation.
   */
  static async recordMovement(tx: any, params: {
    creatorId: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    description: string;
    referenceId: string;
    referenceType: "DONATION" | "WITHDRAWAL" | "ADJUSTMENT";
  }) {
    const { creatorId, amount, type, description, referenceId, referenceType } = params;

    // 1. Insert into Ledger
    await tx.insert(ledgerTransaction).values({
      creatorId,
      amount,
      type,
      description,
      referenceId,
      referenceType,
      status: "COMPLETED",
    });

    // 2. Update Creator Balance Atomically
    const multiplier = type === "CREDIT" ? 1 : -1;
    await tx.update(creator)
      .set({
        balance: sql`${creator.balance} + ${amount * multiplier}`
      })
      .where(eq(creator.id, creatorId));
  }

  /**
   * Specifically for Xendit Payment processing
   */
  static async processPaidDonation(params: {
    donationId: string;
    recipientId: string;
    amount: number;
    webhookPayload: any;
  }) {
    return await db.transaction(async (tx) => {
      // 1. Record Ledger Movement
      await this.recordMovement(tx, {
        creatorId: params.recipientId,
        amount: params.amount,
        type: "CREDIT",
        description: `Donation Received (${params.donationId})`,
        referenceId: params.donationId,
        referenceType: "DONATION",
      });

      // 2. Log Payment
      await tx.insert(paymentLog).values({
        donationId: params.donationId,
        type: "WEBHOOK_PAID",
        status: "SUCCESS",
        payload: params.webhookPayload,
      });
    });
  }
}
