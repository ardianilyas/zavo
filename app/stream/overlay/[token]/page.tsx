import { db } from "@/db";
import { creator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OverlayClient } from "./overlay-client";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function OverlayPage({ params }: PageProps) {
  const { token } = await params;

  // Find creator by streamToken only
  const targetCreator = await db.query.creator.findFirst({
    where: (creators, { eq }) => eq(creators.streamToken, token)
  });

  if (!targetCreator) {
    return notFound();
  }

  // Pusher Config
  const appKey = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  // Channel Name
  const channelName = `stream-${targetCreator.username}`;

  return (
    <OverlayClient
      channelName={channelName}
      appKey={appKey}
      cluster={cluster}
    />
  );
}
