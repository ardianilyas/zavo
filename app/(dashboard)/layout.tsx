import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatorService } from "@/features/creator/services/creator.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const profiles = await CreatorService.getAllProfilesByUserId(session.user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader profiles={profiles} />
      <main className="flex-1 space-y-4 p-8 pt-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
