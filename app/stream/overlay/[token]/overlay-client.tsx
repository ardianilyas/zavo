"use client";

import { useStreamOverlay } from "@/features/stream/hooks/use-stream-overlay";
import { AlertOverlay } from "@/features/stream/components/alert-overlay";
import { GoalWidget } from "@/features/stream/components/goal-widget";
import { LeaderboardWidget } from "@/features/stream/components/leaderboard-widget";

interface OverlayClientProps {
  creatorId: string;
  username: string;
  channelName: string;
  cluster: string;
  appKey: string;
  settings: {
    isTtsEnabled: boolean;
    ttsMinAmount: number;
    overlaySettings?: any;
    goalOverlaySettings?: any;
  };
  visibleWidgets?: {
    alerts?: boolean;
    goal?: boolean;
    leaderboard?: boolean;
  };
}

export function OverlayClient({ creatorId, username, channelName, cluster, appKey, settings, visibleWidgets }: OverlayClientProps) {
  const { currentAlert } = useStreamOverlay({
    channelName,
    cluster,
    appKey
  });

  const show = visibleWidgets || { alerts: true, goal: true, leaderboard: true };

  return (
    <div className="w-full h-screen overflow-hidden relative font-sans force-light">
      {show.alerts && (
        <AlertOverlay
          currentAlert={currentAlert}
          settings={settings}
        />
      )}

      {/* Widgets Layer */}
      {(show.goal || show.leaderboard) && (
        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-auto z-40">
          {show.goal && (
            <GoalWidget
              creatorId={creatorId}
              username={username}
              cluster={cluster}
              appKey={appKey}
              settings={settings.goalOverlaySettings}
            />
          )}
          {show.leaderboard && (
            <LeaderboardWidget
              creatorId={creatorId}
              channelName={`stream-${username}`}
              cluster={cluster}
              appKey={appKey}
            />
          )}
        </div>
      )}
    </div>
  );
}
