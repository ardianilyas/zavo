import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { donation, transaction, user, creator } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { EventService } from "@/lib/events";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    // Sometimes Xendit uses 'event', sometimes 'webhook_type' depending on the callback
    const eventType = event.event || event.webhook_type;
    console.log(`Xendit Webhook [${eventType}] Received:`, JSON.stringify(event, null, 2));

    // 1. Handle "payment_method.activated" (QR Created - Payment Request API)
    if (eventType === "payment_method.activated") {
      return NextResponse.json({ message: "Payment Method Activated", status: "ok" });
    }

    // 2. Handle "qr.payment" (Direct QR Code / Legacy Callback)
    // Structure: { event: "qr.payment", data: { id: "...", qr_id: "...", reference_id: "...", status: "SUCCEEDED" } }
    if (eventType === "qr.payment") {
      const data = event.data || {};
      const status = data.status;

      if (status === "SUCCEEDED" || status === "PAID" || status === "COMPLETED") {
        const qrId = data.qr_id; // Matches donation.xenditId
        const referenceId = data.reference_id; // Matches donation.externalId

        // Try to find donation by xenditId (qr_id) first, then fallback to externalId (reference_id)
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

        if (targetDonation.status === "PAID") {
          return NextResponse.json({ message: "Already Paid" });
        }

        // ATOMIC BALANCE UPDATE
        await db.update(creator)
          .set({
            balance: sql`${creator.balance} + ${targetDonation.amount}`
          })
          .where(eq(creator.id, targetDonation.recipientId));

        await db.update(donation)
          .set({ status: "PAID", paidAt: new Date() })
          .where(eq(donation.id, targetDonation.id));

        // Fetch recipient to get username for channel
        const recipient = await db.query.creator.findFirst({
          where: eq(creator.id, targetDonation.recipientId)
        });

        if (recipient && recipient.username) {
          await EventService.triggerDonation(recipient.username, {
            donorName: targetDonation.donorName,
            amount: targetDonation.amount,
            message: targetDonation.message || "",
            formattedAmount: `Rp ${targetDonation.amount.toLocaleString("id-ID")}`
          });
        }

        await db.insert(transaction).values({
          donationId: targetDonation.id,
          type: "WEBHOOK_PAID_QR",
          status: "SUCCESS",
          provider: "XENDIT",
          payload: event,
        });

        console.log(`Donation ${targetDonation.id} marked as PAID (qr.payment)`);
        return NextResponse.json({ status: "success" });
      }
    }

    // 3. Handle "payment.succeeded" (Payment Request API)
    if (eventType === "payment.succeeded") {
      const paymentId = event.data?.id;
      const referenceId = event.data?.reference_id;
      const status = event.data?.status;

      if (status !== "SUCCEEDED" && status !== "PAID") {
        return NextResponse.json({ message: "Status not succeeded" }, { status: 400 });
      }

      // Try matching by externalId (Payment Request ID)
      const paymentRequestId = event.data?.payment_request_id;

      const targetDonation = await db.query.donation.findFirst({
        where: (donations, { eq, or }) => or(
          eq(donations.externalId, paymentId),
          eq(donations.externalId, referenceId),
          paymentRequestId ? eq(donations.externalId, paymentRequestId) : undefined
        )
      });

      if (!targetDonation) {
        console.warn(`Donation not found for Payment: ${paymentId}, Ref: ${referenceId}, PR: ${paymentRequestId}`);
        return NextResponse.json({ message: "Donation not found" }, { status: 404 });
      }

      if (targetDonation.status === "PAID") {
        return NextResponse.json({ message: "Already Paid" });
      }

      // ATOMIC BALANCE UPDATE
      await db.update(creator)
        .set({
          balance: sql`${creator.balance} + ${targetDonation.amount}`
        })
        .where(eq(creator.id, targetDonation.recipientId));

      // Update to PAID
      await db.update(donation)
        .set({ status: "PAID", paidAt: new Date() })
        .where(eq(donation.id, targetDonation.id));

      // Fetch recipient for notifications (fix: logic was missing in original block, good practice to add)
      const recipient = await db.query.creator.findFirst({
        where: eq(creator.id, targetDonation.recipientId)
      });

      if (recipient && recipient.username) {
        await EventService.triggerDonation(recipient.username, {
          donorName: targetDonation.donorName,
          amount: targetDonation.amount,
          message: targetDonation.message || "",
          formattedAmount: `Rp ${targetDonation.amount.toLocaleString("id-ID")}`
        });
      }

      // Log Transaction
      await db.insert(transaction).values({
        donationId: targetDonation.id,
        type: "WEBHOOK_PAID",
        status: "SUCCESS",
        provider: "XENDIT",
        payload: event,
      });

      console.log(`Donation ${targetDonation.id} marked as PAID (payment.succeeded)`);

      return NextResponse.json({ status: "success" });
    }

    // Unknown event - acknowledge to stop retries
    return NextResponse.json({ message: "Event ignored" });
  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
