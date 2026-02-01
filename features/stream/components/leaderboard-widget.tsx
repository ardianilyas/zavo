"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "@/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";

interface LeaderboardOverlaySettings {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  headerColor?: string;
  goldColor?: string;
  silverColor?: string;
  bronzeColor?: string;
  borderRadius?: number;
  title?: string;
}

interface LeaderboardWidgetProps {
  creatorId: string;
  channelName: string;
  cluster: string;
  appKey: string;
  settings?: LeaderboardOverlaySettings;
}

export function LeaderboardWidget({ creatorId, channelName, cluster, appKey, settings }: LeaderboardWidgetProps) {
  const { data: leaderboard, refetch } = api.donation.getLeaderboard.useQuery({ creatorId });

  // Defaults
  const backgroundColor = settings?.backgroundColor || "#FFFFFF";
  const textColor = settings?.textColor || "#020617";
  const borderColor = settings?.borderColor || "#E2E8F0";
  const headerColor = settings?.headerColor || "#F8FAFC";
  const goldColor = settings?.goldColor || "#fef08a";
  const silverColor = settings?.silverColor || "#e2e8f0";
  const bronzeColor = settings?.bronzeColor || "#fed7aa";
  const borderRadius = settings?.borderRadius ?? 32;
  const title = settings?.title || "Leaderboard";

  useEffect(() => {
    const pusher = new Pusher(appKey, {
      cluster: cluster,
    });

    const channel = pusher.subscribe(channelName);

    channel.bind("donation", () => {
      console.log("New donation! Refreshing leaderboard...");
      refetch();
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [channelName, cluster, appKey, refetch]);

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 border w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative overflow-hidden"
        style={{
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div className="mb-6 p-4 rounded-3xl ring-1" style={{ backgroundColor: `${textColor}10`, color: textColor, borderColor: `${textColor}20` }}>
          <Trophy className="w-10 h-10" />
        </div>

        <div className="text-center space-y-2 relative z-10">
          <h3 className="font-bold text-xl tracking-tight" style={{ color: textColor }}>No Rankings Yet</h3>
          <p className="text-sm max-w-[240px] leading-relaxed mx-auto" style={{ color: textColor, opacity: 0.6 }}>
            Be the first to support and claim the top spot on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-lg border overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] font-sans"
      style={{
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div
        className="p-6 flex items-center justify-between gap-2 border-b"
        style={{
          borderColor: `${borderColor}40`,
          backgroundColor: headerColor,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${textColor}10` }}>
            <Crown className="w-5 h-5" style={{ color: textColor, opacity: 0.7 }} />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight" style={{ color: textColor }}>{title}</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: textColor, opacity: 0.5 }}>Monthly Rankings</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: textColor, opacity: 0.4 }} />
      </div>

      <div className="flex flex-col p-4 gap-2">
        <AnimatePresence mode="popLayout">
          {leaderboard.map((donor, index) => {
            let rankBg = backgroundColor;
            let rankBorder = borderColor;

            if (index === 0) {
              rankBg = goldColor;
              rankBorder = goldColor;
            } else if (index === 1) {
              rankBg = silverColor;
              rankBorder = silverColor;
            } else if (index === 2) {
              rankBg = bronzeColor;
              rankBorder = bronzeColor;
            }

            const isTop3 = index < 3;

            return (
              <motion.div
                key={donor.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="flex items-center justify-between p-3.5 border transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: rankBg,
                  borderColor: `${rankBorder}80`,
                  borderRadius: `${Math.max(borderRadius - 8, 8)}px`,
                }}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div
                    className="flex items-center justify-center w-7 h-7 shrink-0"
                    style={{
                      backgroundColor: isTop3 ? 'rgba(255,255,255,0.3)' : `${textColor}10`,
                      borderRadius: `${Math.max(borderRadius - 16, 4)}px`,
                    }}
                  >
                    {isTop3 ? (
                      <Medal className="w-4 h-4" style={{ color: textColor, opacity: 0.8 }} />
                    ) : (
                      <span className="text-[10px] font-bold" style={{ color: textColor, opacity: 0.7 }}>{donor.rank}</span>
                    )}
                  </div>
                  <span className="font-bold text-[15px] truncate" style={{ color: textColor }}>
                    {donor.donorName}
                  </span>
                </div>
                <div className="font-mono font-bold text-sm tracking-tighter shrink-0" style={{ color: textColor, opacity: 0.8 }}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(donor.totalAmount)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pb-4 pt-2 text-center">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border"
          style={{
            backgroundColor: `${textColor}05`,
            borderColor: `${borderColor}30`,
          }}
        >
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: textColor, opacity: 0.6 }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: textColor, opacity: 0.5 }}>Updates Realtime</span>
        </div>
      </div>
    </div>
  );
}
