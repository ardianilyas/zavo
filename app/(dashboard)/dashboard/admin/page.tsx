import { api } from "@/trpc/server";
import { AdminStatsOverview } from "@/features/admin/components/admin-stats-overview";
import { RevenueChart } from "@/features/admin/components/revenue-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const stats = await api.admin.getAnalytics();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform analytics and operational status.</p>
        </div>
        <Link href="/dashboard/admin/users">
          <Button>Manage Users</Button>
        </Link>
      </div>

      <AdminStatsOverview stats={stats} />

      <RevenueChart data={stats.chart} />
    </div>
  );
}
