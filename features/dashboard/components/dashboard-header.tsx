"use client";

import Link from "next/link";
import { DashboardNav } from "./dashboard-nav";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "@/components/mode-toggle";
import { CreatorSwitcher } from "./creator-switcher";

interface DashboardHeaderProps {
  profiles: any[]; // Using any[] for now to match the implicit schema type, but strictly should be Creator[]
}

export function DashboardHeader({ profiles = [] }: DashboardHeaderProps) {
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

        {/* Mobile Logo (visible only on small screens) */}
        <div className="flex md:hidden mr-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Zavo</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

