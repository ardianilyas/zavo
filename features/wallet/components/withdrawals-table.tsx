
"use client";

import { useState } from "react";
import { useWithdrawalHistory } from "../hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    <Card className="backdrop-blur-md bg-card/50 border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          Withdrawal History
        </CardTitle>
        <CardDescription>
          View all your withdrawal requests and completed payouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No withdrawals found.
                  </td>
                </tr>
              ) : (
                data?.items.map((tx) => (
                  <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {tx.description || "Withdrawal"}
                      <div className="text-xs text-muted-foreground">Ref: {tx.referenceId || "-"}</div>
                    </td>
                    <td className="p-4 align-middle font-semibold text-red-600">
                      -{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tx.amount)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        tx.status === "COMPLETED" ? "bg-green-500/10 text-green-600" :
                          tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600" :
                            "bg-red-500/10 text-red-600"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
