import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Users, DollarSign, Activity } from "lucide-react";

interface AdminStats {
  users: number;
  revenue: {
    year: number;
    month: number;
    growth: string | number;
  };
  donations: {
    year: number;
    month: number;
  };
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
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.month)}</div>
            <p className="text-xs text-muted-foreground">
              {Number(stats.revenue.growth) > 0 ? "+" : ""}{stats.revenue.growth}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Yearly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.year)}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} Total
            </p>
          </CardContent>
        </Card>

        {/* Yearly Donations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Donations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.donations.year}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} Total count
            </p>
          </CardContent>
        </Card>

        {/* Monthly Donations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Donations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.donations.month}</div>
            <p className="text-xs text-muted-foreground">
              Transactions this month
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
