import { StatsCard } from "@/features/dashboard/components/stats-card";
import {
  Users,
  TrendingUp,
  Heart,
  DollarSign,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyCard } from "@/features/dashboard/components/stream-key-card";
import { TestOverlayCard } from "@/features/dashboard/components/test-overlay-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WithdrawalDialog } from "@/features/wallet/components/withdrawal-dialog";
import { TransactionLedger } from "@/features/wallet/components/transaction-ledger";

interface DashboardViewProps {
  creatorProfile: any;
  stats?: {
    totalDonations: number;
    donationCount: number;
    activeMembers: number;
    newFollowers: number;
  } | null;
}

export function DashboardView({ creatorProfile, stats }: DashboardViewProps) {
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
                title="Active Members"
                value={stats?.activeMembers.toString() || "0"}
                icon={Users}
                description="+0 new this month"
              />
              <StatsCard
                title="Donations"
                value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(stats?.totalDonations || 0)}
                icon={Heart}
                description={`${stats?.donationCount || 0} tips received`}
              />
              <StatsCard
                title="New Followers"
                value={stats?.newFollowers.toString() || "0"}
                icon={TrendingUp}
                description="+0% growth"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 backdrop-blur-md bg-card/50 border-primary/10">
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>
                    Your revenue breakdown across donations, memberships, and shop.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md bg-muted/20">
                    <div className="text-center">
                      <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Revenue Chart Visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-3">
                <TransactionLedger creatorId={creatorProfile.id} />
              </div>
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
