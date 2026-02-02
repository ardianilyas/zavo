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
  { href: "#", label: "Product" },
  { href: "#", label: "Use Cases" },
  { href: "#", label: "Developers" },
  { href: "#", label: "Pricing" },
];

export default function Navbar() {
  const user = useUserStore((state) => state.name);
  const role = useUserStore((state) => state.role);
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
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 dark:to-primary/80">
              Zavo
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Link href="/dashboard">
                  <Button size="sm" className="rounded-full px-5">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full px-5">
                    Get Started
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
                  <SheetTitle className="text-left font-bold text-xl">Zavo</SheetTitle>
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
                          <Button variant="outline" className="w-full rounded-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full rounded-full">
                            Get Started
                          </Button>
                        </Link>
                      </>
                    )}
                  </nav>
                  <div className="flex flex-col gap-2 p-4">

                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
