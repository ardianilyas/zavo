import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequest, platformRevenue } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WalletService } from "@/features/wallet/services/wallet.service";

export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const event = await req.json();
    console.log(`Xendit Disbursement Webhook Received:`, JSON.stringify(event, null, 2));

    const status = event.status;
    const externalId = event.external_id;

    if (!externalId) {
      return NextResponse.json({ message: "Invalid payload: missing external_id" }, { status: 400 });
    }

    // Handle "COMPLETED"
    if (status === "COMPLETED") {
      const targetRequest = await db.query.withdrawalRequest.findFirst({
        where: eq(withdrawalRequest.id, externalId)
      });

      if (!targetRequest) {
        return NextResponse.json({ message: "Withdrawal Request not found" }, { status: 404 });
      }

      if (targetRequest.status === "COMPLETED") {
        return NextResponse.json({ message: "Already Completed" });
      }

      // Mark as COMPLETED and Record Revenue
      await db.transaction(async (tx) => {
        // 1. Update Request Status
        await tx.update(withdrawalRequest)
          .set({
            status: "COMPLETED",
            processedAt: new Date(),
            adminNotes: `Disbursement Succeeded: ${event.id}`
          })
          .where(eq(withdrawalRequest.id, targetRequest.id));


        // 2. Record revenue/fees
        const adminFee = 5000;
        const platformFee = Math.floor(targetRequest.amount * 0.05);

        await tx.insert(platformRevenue).values([
          {
            amount: adminFee,
            type: "ADMIN_FEE",
            description: "Fixed bank transfer fee",
            referenceId: targetRequest.id,
            referenceType: "WITHDRAWAL",
          },
          {
            amount: platformFee,
            type: "PLATFORM_FEE",
            description: "5% platform commission",
            referenceId: targetRequest.id,
            referenceType: "WITHDRAWAL",
          }
        ]);

        // 3. DEBIT the Creator Balance (Deferred Debit)
        await WalletService.recordMovement(tx, {
          creatorId: targetRequest.creatorId,
          amount: targetRequest.amount,
          type: "DEBIT",
          description: `Withdrawal Completed (${targetRequest.id})`,
          referenceId: targetRequest.id,
          referenceType: "WITHDRAWAL",
        });
      });

      return NextResponse.json({ status: "success" });
    }

    // Handle "FAILED" (REFUND)
    if (status === "FAILED") {
      const failureCode = event.failure_code || "UNKNOWN_ERROR";
      const failureMessage = event.failure_message || "No failure message provided";

      const targetRequest = await db.query.withdrawalRequest.findFirst({
        where: eq(withdrawalRequest.id, externalId)
      });

      if (!targetRequest) {
        return NextResponse.json({ message: "Withdrawal Request not found" }, { status: 404 });
      }

      if (targetRequest.status === "REJECTED" || targetRequest.status === "COMPLETED") {
        return NextResponse.json({ message: "Already Processed" });
      }

      // Update Status to REJECTED (No Refund Needed)
      await db.update(withdrawalRequest)
        .set({
          status: "REJECTED",
          processedAt: new Date(),
          adminNotes: `Disbursement Failed: ${failureCode} - ${failureMessage}`
        })
        .where(eq(withdrawalRequest.id, targetRequest.id));

      return NextResponse.json({ status: "success", action: "refunded" });
    }

    return NextResponse.json({ message: "Event ignored (Status not handled: " + status + ")" });
  } catch (error) {
    console.error("Disbursement Webhook Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
