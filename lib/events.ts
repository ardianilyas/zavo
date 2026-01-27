import Pusher from "pusher";

// Singleton Pusher instance
const pusherRef = global as unknown as { pusher: Pusher | undefined };

export const pusherServer =
  pusherRef.pusher ||
  new Pusher({
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.PUSHER_CLUSTER || "ap1",
    useTLS: true,
  });

if (process.env.NODE_ENV !== "production") {
  pusherRef.pusher = pusherServer;
}

export type EventType = "donation";

export interface DonationEventData {
  donorName: string;
  amount: number;
  message: string;
  formattedAmount: string; // e.g., "Rp 50.000"
}

export class EventService {
  /**
   * Trigger a real-time event to a specific user's channel.
   * Channel Name Plan: `stream-events-{streamToken}` (secure) or `stream-events-{username}` (public)
   * We'll use `stream-events-{username}` for simplicity internally, mapped from Stream Token later if needed.
   * Ideally, the Overlay Page listens to a channel derived from the user.
   */
  static async triggerDonation(username: string, data: DonationEventData) {
    const channel = `stream-${username}`;
    console.log(`Triggering 'donation' event on channel '${channel}'`, data);

    try {
      await pusherServer.trigger(channel, "donation", data);
    } catch (error) {
      console.error("Pusher Trigger Error:", error);
    }
  }
}
