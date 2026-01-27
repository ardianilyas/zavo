import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
