"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Ban } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <Card className="mx-auto max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
          <CardDescription>
            Your account has been suspended or banned from accessing this platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            If you believe this is a mistake, please contact support.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/login";
                }
              }
            })}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
