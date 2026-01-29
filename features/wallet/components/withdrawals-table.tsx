
"use client";

import { useState } from "react";
import { useWithdrawalHistory } from "../hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

interface WithdrawalsTableProps {
  creatorId: string;
}

export function WithdrawalsTable({ creatorId }: WithdrawalsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWithdrawalHistory(creatorId, 15, page);

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
              <Wallet className="h-5 w-5 text-blue-500" />
              Withdrawal History
            </CardTitle>
            <CardDescription>
              Track your payouts and fund requests.
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
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="h-10 px-6 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No withdrawals found.
                  </td>
                </tr>
              ) : (
                data?.items.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/40 transition-colors hover:bg-muted/30">
                    <td className="p-6 align-middle text-muted-foreground">
                      {format(new Date(tx.createdAt), "EEE, d MMM HH:mm")}
                    </td>
                    <td className="p-6 align-middle font-medium">
                      {tx.description || "Withdrawal"}
                      <div className="text-xs text-muted-foreground mt-0.5 font-normal opacity-70">Ref: <span className="font-mono">{tx.referenceId ? tx.referenceId.slice(0, 8) + '...' : "-"}</span></div>
                    </td>
                    <td className="p-6 align-middle font-bold text-red-600">
                      -{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tx.amount)}
                    </td>
                    <td className="p-6 align-middle">
                      <Badge variant={
                        tx.status === "COMPLETED" ? "default" :
                          tx.status === "PENDING" ? "secondary" : "destructive"
                      } className={cn(
                        "capitalize shadow-none font-medium",
                        tx.status === "COMPLETED" && "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-200/50",
                        tx.status === "PENDING" && "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-200/50",
                      )}>
                        {tx.status.toLowerCase()}
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
