import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donation, creator, paymentLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EventService } from "@/lib/events";
import { WalletService } from "@/features/wallet/services/wallet.service";
import { GoalService } from "@/features/goal/services/goal.service";

export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const event = await req.json();
    const eventType = event.event || event.webhook_type;
    console.log(`Xendit Webhook [${eventType}] Received:`, JSON.stringify(event, null, 2));

    if (eventType === "payment_method.activated") {
      return NextResponse.json({ message: "Payment Method Activated", status: "ok" });
    }

    // 2. Handle "qr.payment" (Direct QR Code / Legacy Callback)
    if (eventType === "qr.payment") {
      const data = event.data || {};
      const status = data.status;

      if (status === "SUCCEEDED" || status === "PAID" || status === "COMPLETED") {
        const qrId = data.qr_id;
        const referenceId = data.reference_id;

        const targetDonation = await db.query.donation.findFirst({
          where: (donations, { eq, or }) => or(
            qrId ? eq(donations.xenditId, qrId) : undefined,
            referenceId ? eq(donations.externalId, referenceId) : undefined
          )
        });

        if (!targetDonation) {
          console.warn(`Donation not found for QR Payment. QR ID: ${qrId}, Ref: ${referenceId}`);
          return NextResponse.json({ message: "Donation not found" }, { status: 404 });
        }

        if (targetDonation.status === "PAID") return NextResponse.json({ message: "Already Paid" });

        // USE WALLET SERVICE (Atomic Update + Ledger)
        await WalletService.processPaidDonation({
          donationId: targetDonation.id,
          recipientId: targetDonation.recipientId,
          amount: targetDonation.amount,
          webhookPayload: event
        });

        // Update Donation Status
        await db.update(donation)
          .set({ status: "PAID", paidAt: new Date() })
          .where(eq(donation.id, targetDonation.id));

        // Update Goal Progress
        await GoalService.updateProgress(targetDonation.recipientId, targetDonation.amount);

        // Notifications
        const recipient = await db.query.creator.findFirst({ where: eq(creator.id, targetDonation.recipientId) });
        if (recipient?.username) {
          await EventService.triggerDonation(recipient.username, {
            donorName: targetDonation.donorName,
            amount: targetDonation.amount,
            message: targetDonation.message || "",
            formattedAmount: `Rp ${targetDonation.amount.toLocaleString("id-ID")}`,
            mediaUrl: targetDonation.mediaUrl || undefined,
            mediaDuration: targetDonation.mediaDuration || undefined
          });
        }

        return NextResponse.json({ status: "success" });
      }
    }

    // 3. Handle "payment.succeeded" (Payment Request API)
    if (eventType === "payment.succeeded") {
      const paymentId = event.data?.id;
      const referenceId = event.data?.reference_id;
      const paymentRequestId = event.data?.payment_request_id;
      const status = event.data?.status;

      if (status !== "SUCCEEDED" && status !== "PAID") {
        return NextResponse.json({ message: "Status not succeeded" }, { status: 400 });
      }

      const targetDonation = await db.query.donation.findFirst({
        where: (donations, { eq, or }) => or(
          eq(donations.externalId, paymentId),
          eq(donations.externalId, referenceId),
          paymentRequestId ? eq(donations.externalId, paymentRequestId) : undefined
        )
      });

      if (!targetDonation) return NextResponse.json({ message: "Donation not found" }, { status: 404 });
      if (targetDonation.status === "PAID") return NextResponse.json({ message: "Already Paid" });

      // USE WALLET SERVICE
      await WalletService.processPaidDonation({
        donationId: targetDonation.id,
        recipientId: targetDonation.recipientId,
        amount: targetDonation.amount,
        webhookPayload: event
      });

      // Update Donation Status
      await db.update(donation)
        .set({ status: "PAID", paidAt: new Date() })
        .where(eq(donation.id, targetDonation.id));

      // Update Goal Progress
      await GoalService.updateProgress(targetDonation.recipientId, targetDonation.amount);

      const recipient = await db.query.creator.findFirst({ where: eq(creator.id, targetDonation.recipientId) });
      if (recipient?.username) {
        await EventService.triggerDonation(recipient.username, {
          donorName: targetDonation.donorName,
          amount: targetDonation.amount,
          message: targetDonation.message || "",
          formattedAmount: `Rp ${targetDonation.amount.toLocaleString("id-ID")}`,
          mediaUrl: targetDonation.mediaUrl || undefined,
          mediaDuration: targetDonation.mediaDuration || undefined
        });
      }

      return NextResponse.json({ status: "success" });
    }




    return NextResponse.json({ message: "Event ignored" });
  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
