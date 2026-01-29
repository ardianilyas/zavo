import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatorService } from "@/features/creator/services/creator.service";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const params = await searchParams;
  const profileId = typeof params.profileId === "string" ? params.profileId : null;

  let creatorProfile = null;

  if (profileId) {
    // 1. Try to fetch specific profile requested
    creatorProfile = await CreatorService.getProfileById(profileId, session.user.id);
  }

  if (!creatorProfile) {
    // 2. Fallback to default (first) profile
    creatorProfile = await CreatorService.getProfileByUserId(session.user.id);
  }

  const stats = creatorProfile ? await CreatorService.getStats(creatorProfile.id) : null;
  const chartData = creatorProfile ? await CreatorService.getRevenueChartData(creatorProfile.id) : [];

  // 2. Render View
  return <DashboardView creatorProfile={creatorProfile} stats={stats} chartData={chartData} />;
}
