import { StatsCard } from "@/features/dashboard/components/stats-card";
import {
  Users,
  TrendingUp,
  Heart,
  DollarSign,
  Sparkles,
  ArrowRight,
  BarChart3,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyCard } from "@/features/dashboard/components/stream-key-card";
import { TestOverlayCard } from "@/features/dashboard/components/test-overlay-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WithdrawalDialog } from "@/features/wallet/components/withdrawal-dialog";
import { RecentDonationsFeed } from "@/features/dashboard/components/recent-donations-feed";

import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { AlertSettingsCard } from "@/features/dashboard/components/alert-settings-card";
import { OverlaySettingsCard } from "@/features/dashboard/components/overlay-settings-card";
import { GoalSettingsCard } from "@/features/dashboard/components/goal-settings-card";
import { GoalOverlaySettingsCard } from "@/features/dashboard/components/goal-overlay-settings-card";
import { LeaderboardOverlaySettingsCard } from "@/features/dashboard/components/leaderboard-overlay-settings-card";

interface DashboardViewProps {
  creatorProfile: any;
  stats?: {
    totalDonations: number;
    donationCount: number;
    currentMonthDonations: number;
    donationGrowth: number;
    currentMonthWithdrawals: number;
    withdrawalGrowth: number;
  } | null;
  chartData?: {
    date: string;
    revenue: number;
  }[];
  recentDonations?: any[];
}

export function DashboardView({ creatorProfile, stats, chartData = [], recentDonations = [] }: DashboardViewProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your community.
        </p>
      </div>

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
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="stream" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Stream Setup</TabsTrigger>
              {/* <TabsTrigger value="donations" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Donations</TabsTrigger> */}
              {/* <TabsTrigger value="members" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Members</TabsTrigger> */}
              {/* <TabsTrigger value="shop" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Shop</TabsTrigger> */}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(creatorProfile.balance)}
                  </div>
                  <WithdrawalDialog creatorId={creatorProfile.id} currentBalance={creatorProfile.balance}>
                    <Button size="sm" className="w-full h-8 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-none">
                      Withdraw Funds
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </WithdrawalDialog>
                </CardContent>
              </Card>

              <StatsCard
                title="Monthly Donations"
                value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(stats?.currentMonthDonations || 0)}
                icon={TrendingUp}
                iconClassName="bg-green-500/10 text-green-500"
                description={`${stats?.donationGrowth.toFixed(1)}% from last month`}
              />

              <StatsCard
                title="Total Donations"
                value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(stats?.totalDonations || 0)}
                icon={Heart}
                iconClassName="bg-rose-500/10 text-rose-500"
                description={`${stats?.donationCount || 0} tips all time`}
              />

              <StatsCard
                title="Monthly Withdrawals"
                value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(stats?.currentMonthWithdrawals || 0)}
                icon={Wallet}
                iconClassName="bg-blue-500/10 text-blue-500"
                description={`${stats?.withdrawalGrowth.toFixed(1)}% from last month`}
              />
            </div>


            <div className="grid gap-6 grid-cols-1">
              <Card className="backdrop-blur-md bg-card/50 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Earnings Overview
                  </CardTitle>
                  <CardDescription>
                    Your revenue breakdown across donations, memberships, and shop.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={chartData} />
                </CardContent>
              </Card>

              <div className="w-full">
                <RecentDonationsFeed creatorId={creatorProfile.id} donations={recentDonations} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stream" className="space-y-10">
            {/* Overlay URLs */}
            <div className="space-y-4">
              <StreamKeyCard streamToken={creatorProfile.streamToken || null} />
            </div>

            {/* Feature Settings Section */}
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Feature Settings</h3>
                <p className="text-sm text-muted-foreground">Configure alerts, TTS, media share, and goals</p>
              </div>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <AlertSettingsCard
                  creatorId={creatorProfile.id}
                  initialSettings={{
                    isTtsEnabled: creatorProfile.isTtsEnabled ?? false,
                    ttsMinAmount: creatorProfile.ttsMinAmount ?? 10000,
                    isMediaShareEnabled: creatorProfile.isMediaShareEnabled ?? false,
                    mediaShareCostPerSecond: creatorProfile.mediaShareCostPerSecond ?? 1000,
                    mediaShareMaxDuration: creatorProfile.mediaShareMaxDuration ?? 180,
                  }}
                />
                <GoalSettingsCard creatorId={creatorProfile.id} />
              </div>
            </div>

            {/* Overlay Customization Section */}
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Overlay Customization</h3>
                <p className="text-sm text-muted-foreground">Personalize the appearance of your stream overlays</p>
              </div>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <OverlaySettingsCard
                  creatorId={creatorProfile.id}
                  initialSettings={creatorProfile}
                />
                <GoalOverlaySettingsCard
                  creatorId={creatorProfile.id}
                  initialSettings={creatorProfile}
                />
                <LeaderboardOverlaySettingsCard
                  creatorId={creatorProfile.id}
                  initialSettings={creatorProfile}
                />
              </div>
            </div>

            {/* Test Overlay */}
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Testing</h3>
                <p className="text-sm text-muted-foreground">Test your overlay configuration before going live</p>
              </div>
              <div className="max-w-xl">
                <TestOverlayCard creatorId={creatorProfile.id} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
