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
    <Card className="border shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-border/40 bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Withdrawals
            </CardTitle>
            <CardDescription className="text-xs">
              History of your payout requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground font-mono min-w-12 text-center">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30">
              <tr>
                <th className="h-10 px-6 font-medium text-muted-foreground w-[20%]">Date</th>
                <th className="h-10 px-6 font-medium text-muted-foreground w-[30%]">Account</th>
                <th className="h-10 px-6 font-medium text-muted-foreground w-[25%] text-right">Amount</th>
                <th className="h-10 px-6 font-medium text-muted-foreground w-[25%] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <Wallet className="h-6 w-6 opacity-50" />
                      </div>
                      <p className="text-sm">No withdrawal history yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.items.map((tx) => (
                  <tr key={tx.id} className="group transition-colors hover:bg-muted/20">
                    <td className="p-6 text-muted-foreground">
                      <span className="block text-foreground font-medium">
                        {format(new Date(tx.createdAt), "MMM d, yyyy")}
                      </span>
                      <span className="text-xs opacity-70">
                        {format(new Date(tx.createdAt), "HH:mm")}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground">{tx.bankCode}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono tracking-wide">{tx.accountNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="truncate max-w-[120px] uppercase">{tx.accountName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-bold tracking-tight text-base">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tx.amount)}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end">
                        <Badge variant="outline" className={cn(
                          "capitalize font-medium border-0 px-2.5 py-0.5 rounded-full",
                          tx.status === "COMPLETED" && "bg-green-500/10 text-green-600 ring-1 ring-inset ring-green-500/20",
                          (tx.status === "PENDING" || tx.status === "PROCESSING") && "bg-yellow-500/10 text-yellow-600 ring-1 ring-inset ring-yellow-500/20",
                          tx.status === "REJECTED" && "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20",
                        )}>
                          {tx.status.toLowerCase()}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
