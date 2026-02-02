"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Play, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { useReplayAlert } from "../hooks/use-replay-alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string | null;
  amount: number;
  message: string | null;
  createdAt: Date;
}

interface RecentDonationsFeedProps {
  creatorId: string;
  donations: Donation[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(date).toLocaleDateString();
}

export function RecentDonationsFeed({ creatorId, donations }: RecentDonationsFeedProps) {
  const { mutate: replayAlert, isPending: isReplaying } = useReplayAlert();

  const handleReplay = (donation: Donation) => {
    replayAlert({
      donationId: donation.id,
    });
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Recent Donations
          </CardTitle>
          <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto font-normal">
            <Link href="/dashboard/donations" className="flex items-center gap-1">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-muted/30 border border-dashed">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-full mb-3">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <p className="text-sm font-medium">No donations yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Share your page to start receiving support!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {donations.slice(0, 10).map((donation) => (
                <div
                  key={donation.id}
                  className="group relative flex items-start gap-3 p-3 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-teal-100 dark:from-rose-950/50 dark:to-teal-950/50 flex items-center justify-center text-xs font-bold ring-2 ring-background">
                      {getInitials(donation.donorName)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate leading-none">
                        {donation.donorName}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {getRelativeTime(donation.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span suppressHydrationWarning>
                        {new Intl.NumberFormat("id-ID", {
                          style: "decimal",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(donation.amount)}
                      </span>
                    </div>

                    {donation.message && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2 relative">
                        <span className="absolute left-2 -top-1 w-2 h-2 bg-muted/50 rotate-45 transform origin-center"></span>
                        <p className="line-clamp-2 italic relative z-10">"{donation.message}"</p>
                      </div>
                    )}

                    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600"
                        onClick={() => handleReplay(donation)}
                        disabled={isReplaying}
                        title="Replay Alert"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
