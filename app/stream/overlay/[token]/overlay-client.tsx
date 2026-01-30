"use client";

import { useStreamOverlay } from "@/features/stream/hooks/use-stream-overlay";
import { OverlayView } from "@/features/stream/components/overlay-view";

interface OverlayClientProps {
  channelName: string;
  cluster: string;
  appKey: string;
  settings: {
    isTtsEnabled: boolean;
    ttsMinAmount: number;
  };
}

export function OverlayClient({ channelName, cluster, appKey, settings }: OverlayClientProps) {
  const { currentAlert } = useStreamOverlay({
    channelName,
    cluster,
    appKey
  });

  return <OverlayView currentAlert={currentAlert} settings={settings} />;
}
