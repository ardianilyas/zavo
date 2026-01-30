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
    <div className="min-h-screen w-full bg-background flex flex-col items-center pb-20">
      {/* Hero Section with Mesh Gradient */}
      <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(76,175,80,0.15),transparent)] animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02]" />
      </div>

      {/* Profile Content */}
      <div className="w-full max-w-xl px-4 -mt-20 sm:-mt-24 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-[6px] border-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-background">
            <AvatarImage src={creatorProfile.image || ""} alt={creatorProfile.name} className="object-cover" />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
              {creatorProfile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {creatorProfile.name}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1 font-medium hover:bg-primary/20 transition-colors">
                  @{creatorProfile.username}
                </Badge>
              </div>
            </div>

            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              {creatorProfile.bio || "Supporting creativity one tip at a time. Thank you for being part of the journey! ✨"}
            </p>
          </div>

          <Card className="w-full border-none bg-background/60 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.05)] overflow-hidden rounded-3xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
            <CardHeader className="pt-10 pb-2">
              <CardTitle className="text-2xl font-bold text-center">Send Support</CardTitle>
              <CardDescription className="text-center text-base">
                Your support helps me keep creating. Tips are truly appreciated!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10">
              <DonationForm
                recipientUsername={creatorProfile.username || ""}
                recipientName={creatorProfile.name}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-6 text-muted-foreground animate-in fade-in duration-1000 delay-500">
            <div className="flex flex-col items-center">
              <span className="text-foreground font-bold text-lg">100%</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold">Secure</span>
            </div>
            <div className="w-px h-8 bg-muted" />
            <div className="flex flex-col items-center">
              <span className="text-foreground font-bold text-lg">Instant</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold">Alerts</span>
            </div>
            <div className="w-px h-8 bg-muted" />
            <div className="flex flex-col items-center">
              <span className="text-foreground font-bold text-lg">Direct</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold">Payout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
