import { db } from "@/db";
import { user } from "@/db/schema";
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

  // Find user by streamToken only
  const targetUser = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.streamToken, token)
  });

  if (!targetUser) {
    return notFound();
  }

  // Pusher Config
  const appKey = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  // Channel Name
  const channelName = `stream-${targetUser.username}`;

  return (
    <OverlayClient
      channelName={channelName}
      appKey={appKey}
      cluster={cluster}
    />
  );
}
