
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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function DashboardNav() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");

  const getHref = (path: string) => {
    return profileId ? `${path}?profileId=${profileId}` : path;
  };

  return (
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
            <Link href={getHref("/dashboard/settings")} className={navigationMenuTriggerStyle()}>
              Settings
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
