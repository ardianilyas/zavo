
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatorService } from "@/features/creator/services/creator.service";
import { DonationsTable } from "@/features/donation/components/donations-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface DonationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DonationsPage({ searchParams }: DonationsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const params = await searchParams;
  const profileId = typeof params.profileId === "string" ? params.profileId : null;
  let creatorProfile = null;

  if (profileId) {
    creatorProfile = await CreatorService.getProfileById(profileId, session.user.id);
  }

  if (!creatorProfile) {
    creatorProfile = await CreatorService.getProfileByUserId(session.user.id);
  }

  if (!creatorProfile) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Become a Creator</CardTitle>
            </div>
            <CardDescription>
              Start your journey to receive donations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/creators">Register as Creator</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
        <p className="text-muted-foreground">
          Manage and viewing your transaction history.
        </p>
      </div>
      <DonationsTable creatorId={creatorProfile.id} />
    </div>
  );
}
