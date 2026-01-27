"use client";

import Link from "next/link";
import { ThemeToggle } from "../mode-toggle";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#", label: "Product" },
  { href: "#", label: "Use Cases" },
  { href: "#", label: "Developers" },
  { href: "#", label: "Pricing" },
];

export default function Navbar() {
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
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-5">
              Get Started
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
