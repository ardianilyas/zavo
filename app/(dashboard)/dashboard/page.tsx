import { StatsCard } from "@/features/dashboard/components/stats-card";
import {
  Users,
  TrendingUp,
  Heart,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user, creator } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StreamKeyCard } from "@/features/dashboard/components/stream-key-card";
import { TestOverlayCard } from "@/features/dashboard/components/test-overlay-card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  // 1. Try to find existing creator profile
  let creatorProfile = await db.query.creator.findFirst({
    where: eq(creator.userId, session.user.id)
  });

  // 2. Auto-Migration: If no creator profile, create one from User data
  if (!creatorProfile) {
    // Fetch user data fallback
    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id)
    });

    if (userData) {
      const newCreator = await db.insert(creator).values({
        userId: session.user.id,
        username: userData.username || `user${Date.now()}`, // Fallback if no username
        name: userData.name,
        bio: userData.bio,
        image: userData.image,
        streamToken: userData.streamToken, // Migrate token!
      }).returning();
      creatorProfile = newCreator[0];
    }
  }

  if (!creatorProfile) redirect("/"); // Should not happen after migration logic

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your community.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="stream" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Stream Setup</TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Donations</TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Members</TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Shop</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Row 1: Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Current Balance"
              value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(creatorProfile.balance)}
              icon={DollarSign}
              description="Available for withdrawal"
            />
            <StatsCard
              title="Active Members"
              value="843"
              icon={Users}
              description="+24 new this month"
            />
            <StatsCard
              title="Donations"
              value="$3,200.00"
              icon={Heart}
              description="156 tips received"
            />
            <StatsCard
              title="New Followers"
              value="+2,350"
              icon={TrendingUp}
              description="+18% growth"
            />
          </div>

          {/* Row 2: Main Chart + Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>
                  Your revenue breakdown across donations, memberships, and shop.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Placeholder for Chart */}
                <div className="h-[350px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md bg-muted/20">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Revenue Chart Visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest tips, subscriptions, and purchases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt="Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-sm text-muted-foreground">
                        Donated $50.00 • "Great stream!"
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-green-600">+$50.00</div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                      <AvatarImage src="/avatars/02.png" alt="Avatar" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Alice Smith</p>
                      <p className="text-sm text-muted-foreground">Subscribed to Tier 2</p>
                    </div>
                    <div className="ml-auto font-medium text-blue-600">+$15.00</div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/03.png" alt="Avatar" />
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Ryan King</p>
                      <p className="text-sm text-muted-foreground">
                        Bought "Digital Asset Pack"
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-purple-600">+$25.00</div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/04.png" alt="Avatar" />
                      <AvatarFallback>ES</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Emma Stone</p>
                      <p className="text-sm text-muted-foreground">
                        Donated $5.00
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-green-600">+$5.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Goals & Top Supporters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>Status of your active fundraising goals.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">New Streaming PC</span>
                      <span className="font-bold text-muted-foreground">$1,250 / $2,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary w-[62.5%]" />
                    </div>
                    <p className="text-xs text-muted-foreground">62.5% funded</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Charity Stream: Save the Ocean</span>
                      <span className="font-bold text-muted-foreground">$450 / $5,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-blue-500 w-[9%]" />
                    </div>
                    <p className="text-xs text-muted-foreground">9% funded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Top Supporters (This Month)</CardTitle>
                <CardDescription>Your most generous community members.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg text-yellow-500">1</div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <span className="font-bold">$550.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg text-gray-400">2</div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MK</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">Mike K.</span>
                    </div>
                    <span className="font-bold">$320.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg text-amber-700">3</div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SL</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">Sarah L.</span>
                    </div>
                    <span className="font-bold">$150.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stream" className="space-y-6">
          <div className="grid gap-4 grid-cols-1">
            <StreamKeyCard streamToken={creatorProfile.streamToken || null} />
            <TestOverlayCard />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
