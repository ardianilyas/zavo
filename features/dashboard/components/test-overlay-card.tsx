"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BellRing, Loader2, Layers } from "lucide-react";
import { useSendTestAlert } from "../hooks/use-send-test-alert";

export function TestOverlayCard({ creatorId }: { creatorId: string }) {
  const { mutate, isPending } = useSendTestAlert();


  const handleSpam = () => {
    toast.info("Sending 3 alerts to test queue...");
    // Trigger 3 times
    let count = 0;
    const interval = setInterval(() => {
      mutate({ creatorId });
      count++;
      if (count >= 3) clearInterval(interval);
    }, 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Overlay</CardTitle>
        <CardDescription>
          Send a dummy donation alert to your overlay to verify the design and sound.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => mutate({ creatorId })}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BellRing className="mr-2 h-4 w-4" />
          )}
          Send Test Alert
        </Button>
        <Button
          onClick={handleSpam}
          disabled={isPending}
          variant="secondary"
          className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"
        >
          <Layers className="mr-2 h-4 w-4" />
          Test Queue (x3)
        </Button>
      </CardContent>
    </Card>
  );
}
