
"use client";

import { useState } from "react";
import { useDonationHistory } from "../hooks/use-donation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

interface DonationsTableProps {
  creatorId: string;
}

export function DonationsTable({ creatorId }: DonationsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDonationHistory(creatorId, page, 15);

  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader className="px-6 py-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-rose-500" />
              Donation History
            </CardTitle>
            <CardDescription>
              Recent support from your community.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b border-border/40 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted">
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Donor</th>
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</th>
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No donations found.
                  </td>
                </tr>
              ) : (
                data?.items.map((donation) => (
                  <tr key={donation.id} className="border-b border-border/40 transition-colors hover:bg-muted/30">
                    <td className="p-6 align-middle text-muted-foreground">
                      {format(new Date(donation.createdAt), "EEE, d MMM HH:mm")}
                    </td>
                    <td className="p-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{donation.donorName}</span>
                          {donation.donorEmail && (
                            <span className="text-xs text-muted-foreground">{donation.donorEmail}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 align-middle font-bold text-emerald-600">
                      +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(donation.amount)}
                    </td>
                    <td className="p-6 align-middle text-muted-foreground max-w-[200px] truncate text-xs">
                      {donation.message || "-"}
                    </td>
                    <td className="p-6 align-middle">
                      <Badge variant={
                        donation.status === "PAID" ? "default" :
                          donation.status === "PENDING" ? "secondary" : "destructive"
                      } className={cn(
                        "capitalize shadow-none font-medium",
                        donation.status === "PAID" && "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200/50",
                        donation.status === "PENDING" && "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-200/50",
                      )}>
                        {donation.status.toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-6 border-t border-border/40 mt-2 bg-muted/5">
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
      </CardContent>
    </Card>
  );
}
