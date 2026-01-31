import { notFound } from "next/navigation";
import { CreatorService } from "@/features/creator/services/creator.service";
import { LeaderboardWidget } from "@/features/stream/components/leaderboard-widget";
import { TRPCProvider } from "@/trpc/provider";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { token } = await params;

  // Find creator by streamToken using Service
  const targetCreator = await CreatorService.getProfileByStreamToken(token);

  if (!targetCreator) {
    return notFound();
  }

  // Pusher Config
  const appKey = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "";
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  // Channel Name
  const channelName = `stream-${targetCreator.username}`;

  return (
    <TRPCProvider>
      <div className="w-screen h-screen overflow-hidden flex items-start justify-start p-8 bg-transparent">
        <LeaderboardWidget
          creatorId={targetCreator.id}
          channelName={channelName}
          appKey={appKey}
          cluster={cluster}
        />
      </div>
    </TRPCProvider>
  );
}
