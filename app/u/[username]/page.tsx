import { notFound } from "next/navigation";
import { db } from "@/db";
import { creator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonationForm } from "@/features/donation/components/donation-form";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  const creatorProfile = await db.query.creator.findFirst({
    where: eq(creator.username, username),
  });

  if (!creatorProfile) {
    notFound();
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={creatorProfile.image || ""} alt={creatorProfile.name} />
          <AvatarFallback>{creatorProfile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{creatorProfile.name}</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {creatorProfile.bio || "No bio yet."}
          </p>
          <div className="flex gap-2 justify-center">
            <Badge variant="secondary">@{creatorProfile.username}</Badge>
          </div>
        </div>
      </div>

      <Card className="border-muted bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Send Support</CardTitle>
          <CardDescription>
            Support {creatorProfile.name} with a donation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonationForm recipientUsername={creatorProfile.username || ""} recipientName={creatorProfile.name} />
        </CardContent>
      </Card>
    </div>
  );
}
