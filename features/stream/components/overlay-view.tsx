"use client";

import { DonationEventData } from "@/lib/events";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface OverlayViewProps {
  currentAlert: DonationEventData | null;
  settings?: {
    isTtsEnabled: boolean;
    ttsMinAmount: number;
  };
}

import { useState } from "react";
import YouTube from "react-youtube";

export function OverlayView({ currentAlert, settings }: OverlayViewProps) {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted && currentAlert && settings?.isTtsEnabled && currentAlert.message) {
      if (currentAlert.amount >= settings.ttsMinAmount) {
        const utterance = new SpeechSynthesisUtterance(currentAlert.message);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentAlert, settings, hasInteracted]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = currentAlert?.mediaUrl ? getYoutubeId(currentAlert.mediaUrl) : null;
  const alertDuration = currentAlert?.mediaDuration ? currentAlert.mediaDuration + 2 : 10;

  if (!hasInteracted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setHasInteracted(true)}
          className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-xl shadow-2xl border-2 border-primary/20 flex flex-col items-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white group-hover:animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <span>Click to Activate Overlay</span>
          <span className="text-sm font-normal text-muted-foreground">Required for video and audio alerts</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-10 overflow-hidden bg-transparent font-sans">
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            key={JSON.stringify(currentAlert)}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="flex flex-col w-full max-w-2xl items-center relative z-50 px-4"
          >
            {videoId && (
              <div className="w-full h-[480px] rounded-2xl overflow-hidden mb-4 shadow-2xl border-4 border-white/20 bg-black">
                <YouTube
                  videoId={videoId}
                  opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                      autoplay: 1,
                      controls: 0,
                      disablekb: 1,
                      playsinline: 1,
                      rel: 0,
                      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                    },
                  }}
                  onReady={(e) => {
                    e.target.playVideo();
                  }}
                  onStateChange={(e) => {
                    // Try to unmute if not yet unmuted
                    if (e.data === 1) { // PLAYING
                      e.target.unMute();
                      e.target.setVolume(100);
                    }
                  }}
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="flex flex-col w-full items-start text-left p-8 bg-[#fae8ff] border border-[#f5d0fe] rounded-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10 w-full">
                <div className="text-lg font-bold text-[#701a75] w-full truncate">
                  {currentAlert.donorName} donated {currentAlert.formattedAmount}
                </div>

                {currentAlert.message && (
                  <div className="mt-2 text-[15px] font-medium text-[#86198f]/80 leading-relaxed break-words w-full">
                    {currentAlert.message}
                  </div>
                )}
              </div>

              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: alertDuration, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-black/5 z-0"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
