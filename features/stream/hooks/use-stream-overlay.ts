import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { DonationEventData } from "@/lib/events";

interface UseStreamOverlayProps {
  channelName: string;
  cluster: string;
  appKey: string;
}

export const useStreamOverlay = ({ channelName, cluster, appKey }: UseStreamOverlayProps) => {
  const [queue, setQueue] = useState<DonationEventData[]>([]);
  const [currentAlert, setCurrentAlert] = useState<DonationEventData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const pusher = new Pusher(appKey, {
      cluster: cluster,
    });

    const channel = pusher.subscribe(channelName);

    channel.bind("donation", (data: DonationEventData) => {
      console.log("New Donation Event:", data);
      setQueue((prev) => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [channelName, cluster, appKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!currentAlert && queue.length > 0 && !isProcessing) {
      setIsProcessing(true);

      // Delay to allow clear transition (1 second gap)
      timeoutRef.current = setTimeout(() => {
        const next = queue[0];
        setCurrentAlert(next);

        // Remove processed item
        setQueue((prev) => prev.slice(1));

        setIsProcessing(false);

        // Show for 10 seconds then clear
        setTimeout(() => {
          setCurrentAlert(null);
        }, 10000);
      }, 1000);
    }
  }, [queue, currentAlert, isProcessing]);

  return {
    currentAlert,
    queueLength: queue.length
  };
};
