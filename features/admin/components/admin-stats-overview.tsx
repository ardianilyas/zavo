import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Users, DollarSign, Activity, Wallet, ArrowUpRight } from "lucide-react";

export interface AdminStats {
  users: number;
  creators: number;
  liability: number;
  revenue: { // Gross Volume
    year: number;
    month: number;
    growth: string | number;
  };
  netRevenue: {
    total: number;
    year: number;
    month: number;
    platformFeeMonth?: number;
  };
  payouts?: {
    month: number;
    impliedFeeMonth: number;
  };
  donations: {
    year: number;
    month: number;
  };
  chart: { date: string; gross: number; net: number }[];
}

export function AdminStatsOverview({ stats }: { stats: AdminStats }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Liability (User Balances) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liability</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(stats.liability)}</div>
            <p className="text-xs text-muted-foreground">
              Total held in creator wallets
            </p>
          </CardContent>
        </Card>

        {/* Realized Payouts (Month) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized Payouts (Month)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-blue-500">{formatCurrency(stats.payouts?.month || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Est. 5% Fee: {formatCurrency(stats.payouts?.impliedFeeMonth || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Revenue (Month) - Platform Fee */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fee (Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.netRevenue.platformFeeMonth || 0)}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Profit</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total Collected: {formatCurrency(stats.netRevenue.month)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gross Volume (Month) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Volume (Month)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.month)}</div>
            <p className="text-xs text-muted-foreground">
              {Number(stats.revenue.growth) > 0 ? "+" : ""}{stats.revenue.growth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
