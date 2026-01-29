import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../init";
import { db } from "@/db";
import { donation, creator, paymentLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { XenditService } from "@/lib/xendit-service";
import { EventService } from "@/lib/events";

export const donationRouter = router({
  create: publicProcedure
    .input(
      z.object({
        recipientUsername: z.string(),
        donorName: z.string().min(1, "Name is required"),
        donorEmail: z.string().email().optional().or(z.literal("")),
        amount: z.number().min(10000, "Minimum donation is Rp 10.000"),
        message: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find Creator by username (Public Persona)
      const recipient = await db.query.creator.findFirst({
        where: eq(creator.username, input.recipientUsername),
      });

      if (!recipient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recipient not found" });
      }

      // Check for authenticated user to link donation
      const donorId = ctx.session?.user?.id || null;

      const isDev = process.env.NODE_ENV === "development";
      const referenceId = `zavo-${Date.now()}`;
      let externalId = referenceId;
      let xenditId = "";
      let paymentUrl = "";
      let qrString = "";

      try {
        const data = await XenditService.createQRCode({
          referenceId,
          amount: input.amount,
          currency: "IDR",
          channelCode: "ID_DANA", // User requested specific channel or we can omit
          metadata: {
            sku: `donation-${recipient.username}`,
            recipientId: recipient.id, // Now Creator ID
            donorName: input.donorName,
            donorId: donorId || undefined, // Metadata tracking
            message: input.message || ""
          }
        });

        console.log("Xendit Success:", data);

        xenditId = data.id; // Store Xendit ID
        qrString = data.qr_string || "";

        if (qrString) {
          paymentUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
        }

      } catch (error) {
        console.error("Payment Gateway Error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Payment Gateway Error" });
      }

      const newDonation = await db
        .insert(donation)
        .values({
          recipientId: recipient.id, // Stores Creator ID
          donorId: donorId,
          donorName: input.donorName,
          donorEmail: input.donorEmail || null,
          amount: input.amount,
          message: input.message,
          status: "PENDING",
          externalId: externalId, // Our Reference
          xenditId: xenditId,     // Xendit ID
          paymentUrl: paymentUrl,
          qrString: qrString || null,
        })
        .returning();

      await db.insert(paymentLog).values({
        donationId: newDonation[0].id,
        type: "QR_CREATED",
        status: "PENDING",
        provider: "XENDIT",
        payload: { externalId, xenditId },
      });

      return {
        donationId: newDonation[0].xenditId,
        paymentUrl: paymentUrl,
        isDev,
      };
    }),

  simulatePay: publicProcedure
    .input(z.object({ donationId: z.string() }))
    .mutation(async ({ input }) => {
      const isDev = process.env.NODE_ENV === "development";

      if (!isDev) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Dev mode only" });
      }

      const targetDonation = await db.query.donation.findFirst({
        where: eq(donation.xenditId, input.donationId)
      });

      if (!targetDonation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const triggerEvent = async (donationId: string) => {
        const d = await db.query.donation.findFirst({ where: eq(donation.id, donationId) });
        if (!d) return;
        // Find recipient in CREATOR table
        const r = await db.query.creator.findFirst({ where: eq(creator.id, d.recipientId) });
        if (r && r.username) {
          await EventService.triggerDonation(r.username, {
            donorName: d.donorName,
            amount: d.amount,
            message: d.message || "",
            formattedAmount: `Rp ${d.amount.toLocaleString("id-ID")}`
          });
        }
      };

      // Mock fallback
      if (targetDonation.externalId && targetDonation.externalId.startsWith("mock-")) {
        await db.update(donation).set({ status: "PAID", paidAt: new Date() }).where(eq(donation.id, input.donationId));
        await triggerEvent(input.donationId);
        return { success: true, method: "MOCK_DB_UPDATE" };
      }

      try {
        // Use xenditId (qr_...) for simulation URL if available, otherwise try externalId
        const simulateId = targetDonation.xenditId || targetDonation.externalId;
        console.log("Simulating using ID:", simulateId);

        if (!simulateId) throw new Error("No ID found for simulation");

        await XenditService.simulatePayment(simulateId, targetDonation.amount);
        return { success: true, method: "XENDIT_SIMULATOR" };
      } catch (e) {
        console.error("Simulation Error", e);
        // Fallback manual
        await db.update(donation).set({ status: "PAID", paidAt: new Date() }).where(eq(donation.id, input.donationId));
        await triggerEvent(input.donationId);
        return { success: true, method: "FALLBACK_MANUAL" };
      }
    }),

  sendTestAlert: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { user } = ctx.session;

      // Find Creator Profile for this User
      const creatorProfile = await db.query.creator.findFirst({
        where: eq(creator.userId, user.id)
      });

      if (!creatorProfile || !creatorProfile.username) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User has no creator profile" });
      }

      await EventService.triggerDonation(creatorProfile.username, {
        donorName: "Test User",
        amount: 50000,
        message: "This is a test donation alert to verify your overlay!",
        formattedAmount: "Rp 50.000"
      });

      return { success: true };
    }),
});
