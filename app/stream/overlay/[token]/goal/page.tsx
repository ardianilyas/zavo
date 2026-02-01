import { notFound } from "next/navigation";
import { OverlayClient } from "../overlay-client";
import { CreatorService } from "@/features/creator/services/creator.service";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function GoalPage({ params }: PageProps) {
  const { token } = await params;

  const targetCreator = await CreatorService.getProfileByStreamToken(token);

  if (!targetCreator) {
    return notFound();
  }

  const appKey = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
  const channelName = `stream-${targetCreator.username}`;

  return (
    <OverlayClient
      creatorId={targetCreator.id}
      username={targetCreator.username}
      channelName={channelName}
      appKey={appKey}
      cluster={cluster}
      settings={{
        isTtsEnabled: targetCreator.isTtsEnabled ?? false,
        ttsMinAmount: targetCreator.ttsMinAmount ?? 10000,
        overlaySettings: targetCreator.overlaySettings,
      }}
      visibleWidgets={{
        alerts: false,
        goal: true,
        leaderboard: false,
      }}
    />
  );
}
