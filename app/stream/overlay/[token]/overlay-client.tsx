"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!currentAlert && queue.length > 0) {
      const next = queue[0];
      setCurrentAlert(next);
      setQueue((prev) => prev.slice(1));

      // Play sound (optional, placeholder)
      // const audio = new Audio("/alert.mp3");
      // audio.play().catch(e => console.error("Audio play failed", e));

      // Show for 5 seconds then clear
      setTimeout(() => {
        setCurrentAlert(null);
      }, 5000);
    }
  }, [queue, currentAlert]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-end pb-20 overflow-hidden bg-transparent">
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center text-center p-6 bg-white/90 border-4 border-yellow-400 rounded-xl shadow-2xl max-w-lg"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
              NEW DONATION!
            </div>
            <div className="text-4xl font-extrabold mt-2 text-slate-900">
              {currentAlert.formattedAmount}
            </div>
            <div className="text-xl font-semibold mt-1 text-slate-700">
              from <span className="text-blue-600">{currentAlert.donorName}</span>
            </div>
            {currentAlert.message && (
              <div className="mt-4 text-lg italic text-slate-600 font-medium bg-slate-100 p-3 rounded-lg w-full break-words">
                "{currentAlert.message}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
