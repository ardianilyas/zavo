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

export function OverlayView({ currentAlert, settings }: OverlayViewProps) {
  useEffect(() => {
    if (currentAlert && settings?.isTtsEnabled && currentAlert.message) {
      // Check minimum amount
      // Assuming currentAlert.amount is available (raw integer). 
      // If only formattedAmount is available, we might need raw amount in event data.
      // Let's check event definition in lib/events.ts or usage. 
      // Based on schema, donation has integer amount. 
      // For now, I'll assume currentAlert has 'amount' property as per DonationEventData definition.

      if (currentAlert.amount >= settings.ttsMinAmount) {
        const utterance = new SpeechSynthesisUtterance(currentAlert.message);
        // Optional: Set voice, rate, pitch if needed. using default for now.
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentAlert, settings]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-10 overflow-hidden bg-transparent font-sans">
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            key={JSON.stringify(currentAlert)}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="flex flex-col w-full max-w-2xl items-start text-left p-8 bg-[#fae8ff] border border-[#f5d0fe] rounded-2xl shadow-xl z-50 relative overflow-hidden"
          >
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
              transition={{ duration: 10, ease: "linear" }}
              className="absolute inset-y-0 left-0 bg-black/5 z-0"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
