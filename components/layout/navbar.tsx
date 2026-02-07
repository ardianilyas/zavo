"use client";

import Link from "next/link";
import { ThemeToggle } from "../mode-toggle";
import { Button } from "../ui/button";
import { useUserStore } from "@/store/use-user-store";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#", label: "Docs" },
  { href: "#", label: "Pricing" },
];

export default function Navbar() {
  const user = useUserStore((state) => state.name);
  const clearUser = useUserStore((state) => state.clearUser);
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearUser();
          toast.success("Signed out successfully");
          setIsOpen(false);
        },
      },
    });
  };

  return (
    <header className="fixed top-10 left-0 right-0 z-50 px-6">
      <div className="container mx-auto max-w-4xl bg-white/70 dark:bg-background/80 backdrop-blur-md border border-gray-200/40 dark:border-border/40 rounded-full shadow-sm">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white">Z</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Zavo
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-muted-foreground transition-colors hover:text-black dark:hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-black">
                    Sign Out
                  </Button>
                  <Link href="/dashboard">
                    <Button size="sm" className="rounded-md px-5 bg-primary hover:bg-primary/90 text-white">
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black dark:text-muted-foreground dark:hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="rounded-md px-5 bg-primary hover:bg-primary/90 text-white">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle className="text-left font-bold text-xl flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-white">Z</span>
                      </div>
                      Zavo
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-8">
                    <nav className="flex flex-col gap-4 p-4">
                      {links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      ))}
                      {user ? (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground text-left"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full rounded-md">
                              Sign In
                            </Button>
                          </Link>
                          <Link href="/register" onClick={() => setIsOpen(false)}>
                            <Button className="w-full rounded-md bg-primary hover:bg-primary/90">
                              Sign up
                            </Button>
                          </Link>
                        </>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
