import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatorService } from "@/features/creator/services/creator.service";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  // 1. Fetch using Service
  const creatorProfile = await CreatorService.getProfileByUserId(session.user.id);

  // 2. Render View
  return <DashboardView creatorProfile={creatorProfile} />;
}
