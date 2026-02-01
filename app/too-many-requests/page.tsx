"use client";

import { Button } from "@/components/ui/button";

// Client component wrapper for the page content
export default function Page() {
  return (
    <TooManyRequestsContent />
  );
}

import Link from "next/link";
import { AlertCircle } from "lucide-react";

function TooManyRequestsContent() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          429
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Too Many Requests
        </h2>
        <p className="mt-4 text-muted-foreground">
          We've detected an unusual amount of traffic from your network. Please wait a moment before trying again.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
