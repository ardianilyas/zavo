
"use client";

import { useState } from "react";
import { useDonationHistory, useReplayAlert } from "../hooks/use-donation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Heart, RotateCcw } from "lucide-react";

interface DonationsTableProps {
  creatorId: string;
}

export function DonationsTable({ creatorId }: DonationsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDonationHistory(creatorId, page, 15);
  const replayMutation = useReplayAlert();

  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card/40 rounded-xl border border-dashed border-border/40">
            No donations found.
          </div>
        ) : (
          data?.items.map((donation) => (
            <Card key={donation.id} className="group relative overflow-hidden border border-emerald-500/20 shadow-xl bg-emerald-500/5 backdrop-blur-xl hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 rounded-3xl">
              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500" />

              <CardContent className="p-7 relative z-10">
                {/* Top Action & Amount */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="font-black text-3xl text-emerald-500 tracking-tighter drop-shadow-sm">
                      +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(donation.amount)}
                    </span>
                    <div className="flex flex-col mt-2">
                      <span className="font-bold text-base text-card-foreground/90">{donation.donorName}</span>
                      {donation.donorEmail && (
                        <span className="text-xs text-muted-foreground/60 leading-none mt-0.5">{donation.donorEmail}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border border-emerald-500/20 transition-all active:scale-95"
                    onClick={() => replayMutation.mutate({ donationId: donation.id })}
                    disabled={replayMutation.isPending}
                    title="Replay Alert"
                  >
                    {replayMutation.isPending && replayMutation.variables?.donationId === donation.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Message */}
                <div className="relative p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/10 backdrop-blur-sm group-hover:border-emerald-500/20 transition-colors duration-500">
                  <p className="text-sm text-muted-foreground/80 italic leading-relaxed font-medium">
                    &ldquo;{donation.message || "No message left."}&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-6 border-t border-border/40 mt-6 bg-card/40 rounded-xl backdrop-blur-sm">
        <div className="text-xs text-muted-foreground">
          Showing page {page} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
