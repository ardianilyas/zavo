"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useUserStore } from "@/store/use-user-store";
import {
  Shield,
  Users,
  LayoutDashboard,
  Settings,
  BarChart3,
  CreditCard,
  Bell,
  FileText
} from "lucide-react";

export function DashboardNav() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");
  const role = useUserStore((state) => state.role);

  const getHref = (path: string) => {
    return profileId ? `${path}?profileId=${profileId}` : path;
  };

  return (
    <div className="flex items-center gap-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getHref("/dashboard")} className={navigationMenuTriggerStyle()}>
                Dashboard
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getHref("/dashboard/donations")} className={navigationMenuTriggerStyle()}>
                Donations
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getHref("/dashboard/withdrawals")} className={navigationMenuTriggerStyle()}>
                Withdrawals
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/creators" className={navigationMenuTriggerStyle()}>
                Creators
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getHref("/dashboard/analytics")} className={navigationMenuTriggerStyle()}>
                Analytics
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getHref("/dashboard/community")} className={navigationMenuTriggerStyle()}>
                Communities
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getHref("/dashboard/settings")} className={navigationMenuTriggerStyle()}>
                Settings
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {role === "admin" && (
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 data-[state=open]:bg-rose-50 dark:data-[state=open]:bg-rose-950/30">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </NavigationMenuTrigger>
              <NavigationMenuContent className="right-0 left-auto !bg-white/80 dark:!bg-gray-950/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_8px_40px_-8px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
                <div className="w-md p-4">
                  {/* Header */}
                  <div className="mb-3 px-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Administration
                    </p>
                  </div>

                  {/* Grid of feature items */}
                  <div className="grid grid-cols-1 gap-2">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/dashboard/admin"
                        className="group flex flex-row items-start gap-3 rounded-xl p-3 transition-all hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/25">
                          <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Overview</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">Platform stats & metrics</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <Link
                        href="/dashboard/admin/users"
                        className="group flex flex-row items-start gap-3 rounded-xl p-3 transition-all hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/25">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Users</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">Manage users & creators</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
    </div>
  );
}


