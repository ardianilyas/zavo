import { StatsCard } from "@/features/dashboard/components/stats-card";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your projects and performance.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Reports</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Row 1: Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value="$45,231.89"
              icon={DollarSign}
              description="+20.1% from last month"
            />
            <StatsCard
              title="Subscriptions"
              value="+2350"
              icon={Users}
              description="+180.1% from last month"
            />
            <StatsCard
              title="Active Projects"
              value="12"
              icon={Zap}
              description="+19% from last month"
            />
            <StatsCard
              title="Active Now"
              value="+573"
              icon={Activity}
              description="+201 since last hour"
            />
          </div>

          {/* Row 2: Main Chart + Sidebar */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Your monthly revenue and project performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Placeholder for Chart */}
                <div className="h-[350px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md bg-muted/20">
                  Chart Component Visualization
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt="Avatar" />
                      <AvatarFallback>OM</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Olivia Martin</p>
                      <p className="text-sm text-muted-foreground">
                        olivia.martin@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+$1,999.00</div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                      <AvatarImage src="/avatars/02.png" alt="Avatar" />
                      <AvatarFallback>JL</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Jackson Lee</p>
                      <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                    </div>
                    <div className="ml-auto font-medium">+$39.00</div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/03.png" alt="Avatar" />
                      <AvatarFallback>IN</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Isabella Nguyen</p>
                      <p className="text-sm text-muted-foreground">
                        isabella.nguyen@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+$299.00</div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/04.png" alt="Avatar" />
                      <AvatarFallback>WK</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">William Kim</p>
                      <p className="text-sm text-muted-foreground">
                        will@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+$99.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Team & Progress */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Active team members on current projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder for Table */}
                  <div className="rounded-md border p-4 bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Project X</span>
                      <span className="text-xs text-muted-foreground">5 Members</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Marketing Campaign</span>
                      <span className="text-xs text-muted-foreground">3 Members</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md bg-card/50 border-primary/10">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Overall completion status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Website Redesign</span>
                      <span className="font-bold">75%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary w-[75%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mobile App Launch</span>
                      <span className="font-bold">32%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary w-[32%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
}
