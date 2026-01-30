import { notFound } from "next/navigation";
import { db } from "@/db";
import { creator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles, Zap, CreditCard } from "lucide-react";
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
    <div className="min-h-screen w-full bg-background flex flex-col items-center pb-20 relative overflow-x-hidden">
      {/* Pastel Hero Section */}
      <div className="w-full h-56 sm:h-72 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl mx-auto opacity-40 blur-3xl bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-pink-400/30 dark:from-indigo-600/20 dark:via-purple-600/20 dark:to-pink-600/20 animate-pulse" />
      </div>

      {/* Profile Content */}
      <div className="w-full max-w-2xl px-4 -mt-24 sm:-mt-32 relative z-10 flex flex-col items-center">
        {/* Profile Avatar Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-full opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-[6px] border-background shadow-xl relative">
            <AvatarImage src={creatorProfile.image || ""} alt={creatorProfile.name} className="object-cover" />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-100 to-purple-100 text-purple-600 font-bold">
              {creatorProfile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-background rounded-full p-1.5 shadow-md text-emerald-500 border border-emerald-100">
            <ShieldCheck className="w-5 h-5 fill-emerald-100" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              {creatorProfile.name}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-purple-200 text-purple-700 dark:text-purple-300 dark:border-purple-800 px-3 py-1 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                @{creatorProfile.username}
              </Badge>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed font-light">
            {creatorProfile.bio || "Supporting creativity one tip at a time. Thank you for being part of the journey! ✨"}
          </p>
        </div>

        <Card className="w-full border-none bg-background/70 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(124,58,237,0.15)] dark:shadow-[0_0_50px_-12px_rgba(124,58,237,0.1)] overflow-hidden rounded-[2rem] animate-in fade-in zoom-in-95 duration-1000 delay-200 ring-1 ring-white/20 dark:ring-white/5">
          <CardHeader className="pt-10 pb-6 text-center space-y-2 relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl rotate-3">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Send Support
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/80">
              Your support empowers me to keep creating amazingly.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-10">
            <div className="max-w-md mx-auto">
              <DonationForm
                recipientUsername={creatorProfile.username || ""}
                recipientName={creatorProfile.name}
                mediaSettings={{
                  isEnabled: creatorProfile.isMediaShareEnabled ?? false,
                  costPerSecond: creatorProfile.mediaShareCostPerSecond ?? 1000,
                  maxDuration: creatorProfile.mediaShareMaxDuration ?? 180,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8 animate-in fade-in duration-1000 delay-500">
          <div className="flex flex-col items-center p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
            <ShieldCheck className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">100% Secure</span>
            <span className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-0.5">Encrypted Payments</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20">
            <Zap className="w-6 h-6 text-purple-500 mb-2" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Instant Alerts</span>
            <span className="text-xs text-purple-600/60 dark:text-purple-400/60 mt-0.5">On Stream Display</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-pink-50/50 dark:bg-pink-900/10 rounded-2xl border border-pink-100/50 dark:border-pink-900/20">
            <CreditCard className="w-6 h-6 text-pink-500 mb-2" />
            <span className="text-sm font-bold text-pink-700 dark:text-pink-300">Direct Payout</span>
            <span className="text-xs text-pink-600/60 dark:text-pink-400/60 mt-0.5">To Creator's Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
