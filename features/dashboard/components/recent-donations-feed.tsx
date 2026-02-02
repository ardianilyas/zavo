"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSendTestAlert } from "../hooks/use-send-test-alert";
import { toast } from "sonner";

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
  const { mutate: sendTestAlert, isPending } = useSendTestAlert();

  const handleReplay = (donation: Donation) => {
    sendTestAlert({
      creatorId,
      donorName: donation.donorName,
      amount: donation.amount,
      message: donation.message || undefined,
    });
    toast.success("Alert replayed!");
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
              <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Recent Donations</CardTitle>
              <CardDescription className="mt-0.5">
                Latest support from your community
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/donations" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-muted/50 rounded-full mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No donations yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Share your donation page with your community to start receiving support!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.slice(0, 10).map((donation) => (
              <div
                key={donation.id}
                className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all duration-200"
              >
                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {getInitials(donation.donorName)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{donation.donorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(donation.createdAt)}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-rose-600 dark:text-rose-400 shrink-0">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(donation.amount)}
                    </span>
                  </div>

                  {donation.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      "{donation.message}"
                    </p>
                  )}

                  {/* Replay button - shows on hover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReplay(donation)}
                    disabled={isPending}
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Replay Alert
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
