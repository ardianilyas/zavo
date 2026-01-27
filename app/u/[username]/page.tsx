import { notFound } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
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

  const creator = await db.query.user.findFirst({
    where: eq(user.username, username),
  });

  if (!creator) {
    notFound();
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={creator.image || ""} alt={creator.name} />
          <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{creator.name}</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {creator.bio || "No bio yet."}
          </p>
          <div className="flex gap-2 justify-center">
            <Badge variant="secondary">@{creator.username}</Badge>
          </div>
        </div>
      </div>

      <Card className="border-muted bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Send Support</CardTitle>
          <CardDescription>
            Support {creator.name} with a donation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonationForm recipientUsername={creator.username || ""} recipientName={creator.name} />
        </CardContent>
      </Card>
    </div>
  );
}
