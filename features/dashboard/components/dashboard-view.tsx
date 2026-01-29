"use client";

import { StatsCard } from "@/features/dashboard/components/stats-card";
import {
  Users,
  TrendingUp,
  Heart,
  DollarSign,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StreamKeyCard } from "@/features/dashboard/components/stream-key-card";
import { TestOverlayCard } from "@/features/dashboard/components/test-overlay-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  creatorProfile: any; // Type should be inferred from Schema or specialized type
}

export function DashboardView({ creatorProfile }: DashboardViewProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your community.
        </p>
      </div>

      {/* FAN / NEW USER VIEW Check */}
      {!creatorProfile ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Become a Creator</CardTitle>
            </div>
            <CardDescription>
              Start your journey, receive donations, and build your community on Zavo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/creators">Register as Creator</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* CREATOR VIEW */
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
                    {/* Simplified mock items from original */}
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
      )}
    </div>
  );
}
