"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "@/trpc/client";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";

interface LeaderboardWidgetProps {
  creatorId: string;
  channelName: string;
  cluster: string;
  appKey: string;
}

export function LeaderboardWidget({ creatorId, channelName, cluster, appKey }: LeaderboardWidgetProps) {
  const { data: leaderboard, refetch } = api.donation.getLeaderboard.useQuery({ creatorId });

  useEffect(() => {
    const pusher = new Pusher(appKey, {
      cluster: cluster,
    });

    const channel = pusher.subscribe(channelName);

    channel.bind("donation", () => {
      // Refresh leaderboard on new donation
      console.log("New donation! Refreshing leaderboard...");
      refetch();
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [channelName, cluster, appKey, refetch]);

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-[2.5rem] border border-border text-muted-foreground w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative overflow-hidden group">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

        <div className="mb-6 p-4 bg-primary/10 rounded-3xl text-primary ring-1 ring-primary/20">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="text-center space-y-2 relative z-10">
          <h3 className="text-foreground font-bold text-xl tracking-tight">No Rankings Yet</h3>
          <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed mx-auto">
            Be the first to support and claim the top spot on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-lg bg-card rounded-[2rem] border border-border overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] font-sans text-foreground">
      <div className="p-6 flex items-center justify-between gap-2 border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-foreground font-bold text-lg tracking-tight">Leaderboard</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Monthly Rankings</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
      </div>

      <div className="flex flex-col p-4 gap-2">
        <AnimatePresence mode="popLayout">
          {leaderboard.map((donor, index) => {
            const isTop3 = index < 3;
            let rankStyles = "bg-muted/30 border-border/50 text-muted-foreground";
            let rankIcon = <span className="text-[10px] font-bold w-5 text-center">{donor.rank}</span>;

            if (index === 0) {
              rankStyles = "bg-[#fefce8] border-[#fef08a] text-[#854d0e]";
              rankIcon = <Medal className="w-4 h-4 text-[#a16207]" />;
            } else if (index === 1) {
              rankStyles = "bg-[#f8fafc] border-[#e2e8f0] text-[#475569]";
              rankIcon = <Medal className="w-4 h-4 text-[#64748b]" />;
            } else if (index === 2) {
              rankStyles = "bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]";
              rankIcon = <Medal className="w-4 h-4 text-[#c2410c]" />;
            } else {
              // Neutral saturation/opacity steps for others
              rankStyles = `bg-muted/20 border-border/30 text-foreground/70`;
            }

            return (
              <motion.div
                key={donor.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${rankStyles} transition-all duration-300 shadow-sm`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-xl ${isTop3 ? 'bg-white/30' : 'bg-background/40'} shrink-0`}>
                    {rankIcon}
                  </div>
                  <span className={`font-bold text-[15px] truncate ${isTop3 ? '' : 'text-foreground/90'}`}>
                    {donor.donorName}
                  </span>
                </div>
                <div className="font-mono font-bold text-sm tracking-tighter shrink-0 opacity-80">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(donor.totalAmount)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pb-4 pt-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full border border-border/30">
          <div className="w-1 h-1 rounded-full bg-primary/60" />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Updates Realtime</span>
        </div>
      </div>
    </div>
  );
}
