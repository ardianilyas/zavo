import { api } from "@/trpc/server";
import { AdminStatsOverview } from "@/features/admin/components/admin-stats-overview";

export default async function AdminPage() {
  const stats = await api.admin.getAnalytics();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
         <p className="text-muted-foreground">Platform analytics and operational status.</p>
      </div>

      <AdminStatsOverview stats={stats} />
    </div>
  );
}
