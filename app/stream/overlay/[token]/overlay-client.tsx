"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { DonationEventData } from "@/lib/events";
import { AnimatePresence, motion } from "framer-motion";

interface OverlayClientProps {
  channelName: string;
  cluster: string;
  appKey: string;
}

export function OverlayClient({ channelName, cluster, appKey }: OverlayClientProps) {
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
        const next = queue[0]; // Note: queue might be stale here, but head should be stable for FIFO
        setCurrentAlert(next);

        // Use functional update to safely remove the head regardless of new additions
        setQueue((prev) => prev.slice(1));

        setIsProcessing(false);

        // Play sound (optional, placeholder)
        // const audio = new Audio("/alert.mp3");
        // audio.play().catch(e => console.error("Audio play failed", e));

        // Show for 10 seconds then clear
        setTimeout(() => {
          setCurrentAlert(null);
        }, 10000);
      }, 1000);
    }
  }, [queue, currentAlert, isProcessing]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-10 overflow-hidden bg-transparent font-sans">

      {/* PREVIEW UI */}
      {/* <AnimatePresence mode="wait">
        {!currentAlert && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="flex flex-col w-full max-w-lg items-start text-left p-8 bg-[#fae8ff] border border-[#f5d0fe] rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
          >
            <div className="text-lg font-bold text-[#701a75] w-full truncate">
              ardian donated Rp 200.000
            </div>

            <div className="mt-2 text-[15px] font-medium text-[#86198f]/80 leading-relaxed break-words w-full">
              Keep up the good work!
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* DYNAMIC ALERT UI */}
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            key={JSON.stringify(currentAlert)}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="flex flex-col w-full max-w-2xl items-start text-left p-8 bg-[#fae8ff] border border-[#f5d0fe] rounded-2xl shadow-xl z-50"
          >
            <div className="text-lg font-bold text-[#701a75] w-full truncate">
              {currentAlert.donorName} donated {currentAlert.formattedAmount}
            </div>

            {currentAlert.message && (
              <div className="mt-2 text-[15px] font-medium text-[#86198f]/80 leading-relaxed break-words w-full">
                {currentAlert.message}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
