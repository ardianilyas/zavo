"use client";

import Link from "next/link";
import { DashboardNav } from "./dashboard-nav";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "@/components/mode-toggle";
import { CreatorSwitcher } from "./creator-switcher";

interface DashboardHeaderProps {
  profiles: any[]; // Using any[] for now to match the implicit schema type, but strictly should be Creator[]
}

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/use-user-store";

export function DashboardHeader({ profiles = [] }: DashboardHeaderProps) {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");
  const role = useUserStore((state) => state.role);

  const getHref = (path: string) => {
    return profileId ? `${path}?profileId=${profileId}` : path;
  };

  const MobileLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-lg font-medium hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mr-8 hidden md:flex items-center">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold text-xl sm:inline-block text-primary">
              Zavo
            </span>
          </Link>

          {profiles.length > 0 && <CreatorSwitcher items={profiles} className="mr-4" />}

          <DashboardNav />
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden mr-4 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader className="px-6 text-left">
                <SheetTitle>
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <span className="font-bold text-2xl text-primary">Zavo</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 mt-8 px-6">
                {profiles.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Account</label>
                    <CreatorSwitcher items={profiles} className="w-full justify-between h-9 text-sm" />
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2">Menu</label>
                  <MobileLink href={getHref("/dashboard")}>Dashboard</MobileLink>
                  <MobileLink href={getHref("/dashboard/donations")}>Donations</MobileLink>
                  <MobileLink href={getHref("/dashboard/withdrawals")}>Withdrawals</MobileLink>
                  <MobileLink href="/creators">Creators</MobileLink>
                  <MobileLink href={getHref("/dashboard/analytics")}>Analytics</MobileLink>
                  <MobileLink href={getHref("/dashboard/settings")}>Settings</MobileLink>
                  {role === "admin" && (
                    <MobileLink href="/dashboard/admin">
                      <span className="text-rose-600">Admin</span>
                    </MobileLink>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

