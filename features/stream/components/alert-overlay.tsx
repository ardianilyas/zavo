"use client";

import { DonationEventData } from "@/lib/events";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { LeaderboardWidget } from "./leaderboard-widget";
import { GoalWidget } from "./goal-widget";

interface AlertOverlayProps {
  currentAlert: DonationEventData | null;
  settings?: {
    isTtsEnabled: boolean;
    ttsMinAmount: number;
    overlaySettings?: any;
  };
}


import YouTube from "react-youtube";

export function AlertOverlay({ currentAlert, settings }: AlertOverlayProps) {
  const overlayStyles = settings?.overlaySettings || {};

  const backgroundColor = overlayStyles.backgroundColor || "#fae8ff";
  const textColor = overlayStyles.textColor || "#701a75";
  const borderColor = overlayStyles.borderColor || "#f5d0fe";
  const animationType = overlayStyles.animationType || "fade";

  useEffect(() => {
    if (currentAlert && settings?.isTtsEnabled && currentAlert.message) {
      if (currentAlert.amount >= settings.ttsMinAmount) {
        const utterance = new SpeechSynthesisUtterance(currentAlert.message);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentAlert, settings]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = currentAlert?.mediaUrl ? getYoutubeId(currentAlert.mediaUrl) : null;
  const alertDuration = currentAlert?.mediaDuration ? currentAlert.mediaDuration + 2 : 10;

  // Animation Variants
  const variants = {
    initial:
      animationType === "slide" ? { y: 100, opacity: 0 } :
        animationType === "bounce" ? { scale: 0.8, opacity: 0 } :
          { y: -50, opacity: 0, scale: 0.9 }, // fade/default
    animate:
      animationType === "slide" ? { y: 0, opacity: 1 } :
        animationType === "bounce" ? { scale: 1, opacity: 1 } :
          { y: 0, opacity: 1, scale: 1 },
    exit:
      animationType === "slide" ? { y: 100, opacity: 0 } :
        animationType === "bounce" ? { scale: 0.8, opacity: 0 } :
          { y: -50, opacity: 0, scale: 0.9 },
  };


  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-10 overflow-hidden bg-transparent font-sans">
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            key={JSON.stringify(currentAlert)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
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
                      mute: 1,
                      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                    },
                  }}
                  onReady={(e) => {
                    // e.target.mute(); // handled by playerVars
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

            <div
              className="flex flex-col w-full items-start text-left p-8 rounded-2xl shadow-xl relative overflow-hidden"
              style={{
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: "1px",
                borderStyle: "solid"
              }}
            >
              <div className="relative z-10 w-full">
                <div
                  className="text-lg font-bold w-full truncate"
                  style={{ color: textColor }}
                >
                  {currentAlert.donorName} donated {currentAlert.formattedAmount}
                </div>

                {currentAlert.message && (
                  <div
                    className="mt-2 text-[15px] font-medium leading-relaxed wrap-break-word w-full"
                    style={{ color: textColor, opacity: 0.9 }}
                  >
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
