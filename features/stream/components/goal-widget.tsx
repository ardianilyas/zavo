
"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/client";
import Pusher from "pusher-js";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

interface GoalOverlaySettings {
  backgroundColor?: string;
  textColor?: string;
  progressBarColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

interface GoalWidgetProps {
  creatorId: string;
  username: string;
  cluster: string;
  appKey: string;
  settings?: GoalOverlaySettings;
}

export function GoalWidget({ creatorId, username, cluster, appKey, settings }: GoalWidgetProps) {
  const { data: initialGoal, refetch } = api.goal.getActive.useQuery({ creatorId });
  const [goalState, setGoalState] = useState<typeof initialGoal | null>(null);

  // Defaults
  const backgroundColor = settings?.backgroundColor || "#FFFFFF";
  const textColor = settings?.textColor || "#020617";
  const progressBarColor = settings?.progressBarColor || "#4CAF50";
  const borderColor = settings?.borderColor || "#E2E8F0";
  const borderRadius = settings?.borderRadius ?? 32;

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
      if (data.status === "ACTIVE") {
        setGoalState({
          id: data.id,
          title: data.title,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          status: data.status,
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: creatorId,
          startDate: new Date(),
          endDate: null
        });
      } else {
        setGoalState(null);
        refetch();
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [username, cluster, appKey, creatorId, refetch]);

  if (!goalState || goalState.status !== "ACTIVE") return null;

  const percentage = Math.min(100, (goalState.currentAmount / goalState.targetAmount) * 100);

  return (
    <div
      className="w-lg backdrop-blur-md border overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] font-sans mb-4"
      style={{
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${progressBarColor}20` }}
            >
              <Target className="w-6 h-6" style={{ color: progressBarColor }} />
            </div>
            <div>
              <h2
                className="font-bold text-lg leading-tight tracking-tight"
                style={{ color: textColor }}
              >
                {goalState.title}
              </h2>
              <p
                className="text-xs font-medium uppercase tracking-widest opacity-60"
                style={{ color: textColor }}
              >
                Goal Progress
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className="block font-black text-2xl leading-none"
              style={{ color: progressBarColor }}
            >
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div
          className="h-6 rounded-full overflow-hidden relative shadow-inner"
          style={{ backgroundColor: `${progressBarColor}20` }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{ backgroundColor: progressBarColor }}
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
          <span style={{ color: textColor }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(goalState.currentAmount)}
          </span>
          <span style={{ color: textColor, opacity: 0.6 }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(goalState.targetAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
