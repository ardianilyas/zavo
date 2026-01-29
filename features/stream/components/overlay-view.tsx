"use client";

import { DonationEventData } from "@/lib/events";
import { AnimatePresence, motion } from "framer-motion";

interface OverlayViewProps {
  currentAlert: DonationEventData | null;
}

export function OverlayView({ currentAlert }: OverlayViewProps) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-10 overflow-hidden bg-transparent font-sans">
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
