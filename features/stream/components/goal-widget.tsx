
"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/client";
import Pusher from "pusher-js";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Flag } from "lucide-react";

interface GoalWidgetProps {
  creatorId: string;
  username: string; // for channel path
  cluster: string;
  appKey: string;
}

export function GoalWidget({ creatorId, username, cluster, appKey }: GoalWidgetProps) {
  const { data: initialGoal, refetch } = api.goal.getActive.useQuery({ creatorId });
  const [goalState, setGoalState] = useState<typeof initialGoal | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setGoalState(initialGoal);
    }
  }, [initialGoal]);

  useEffect(() => {
    const pusher = new Pusher(appKey, {
      cluster: cluster,
    });

    const channelName = `stream-${username}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("goal-progress", (data: any) => {
      console.log("Goal Update:", data);
      // Data matches GoalUpdateData interface
      if (data.status === "ACTIVE") {
        setGoalState({
          id: data.id,
          title: data.title,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          status: data.status,
          createdAt: new Date(), // Dummy date not used for display
          updatedAt: new Date(),
          creatorId: creatorId,
          startDate: new Date(),
          endDate: null
        });
      } else {
        // Goal ended
        setGoalState(null);
        refetch(); // Double check
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [username, cluster, appKey, creatorId, refetch]);

  if (!goalState || goalState.status !== "ACTIVE") return null;

  const percentage = Math.min(100, (goalState.currentAmount / goalState.targetAmount) * 100);

  return (
    <div className="w-lg bg-card/95 backdrop-blur-md rounded-[2rem] border border-border overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] font-sans mb-4 text-foreground">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-tight text-foreground">{goalState.title}</h2>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Goal Progress</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block font-black text-2xl text-primary leading-none">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="h-6 bg-secondary/50 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            className="absolute top-0 left-0 h-full bg-linear-to-r from-primary/80 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />

          {/* Shine effect */}
          <motion.div
            className="absolute top-0 bottom-0 w-12 bg-white/20 skew-x-[-20deg] blur-sm"
            animate={{ left: ["-20%", "120%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatDelay: 3 }}
          />
        </div>

        {/* Amounts */}
        <div className="flex justify-between font-mono font-bold text-sm tracking-tight opacity-80">
          <span className="text-foreground">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(goalState.currentAmount)}</span>
          <span className="text-muted-foreground">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(goalState.targetAmount)}</span>
        </div>
      </div>
    </div>
  );
}
