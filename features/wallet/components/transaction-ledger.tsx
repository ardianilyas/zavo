"use client";

import { useTransactionHistory } from "../hooks/use-wallet";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Loader2, History } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TransactionLedger({ creatorId }: { creatorId: string }) {
  const { data: history, isLoading } = useTransactionHistory(creatorId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-card/50 border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!history?.length && (
            <p className="text-sm text-center text-muted-foreground py-8">No transactions yet.</p>
          )}
          {history?.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  tx.type === "CREDIT" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                )}>
                  {tx.type === "CREDIT" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.createdAt), "MMM d, yyyy • HH:mm")}
                  </p>
                </div>
              </div>
              <div className={cn(
                "text-sm font-bold",
                tx.type === "CREDIT" ? "text-green-600" : "text-red-600"
              )}>
                {tx.type === "CREDIT" ? "+" : "-"}
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
