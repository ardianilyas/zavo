"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BellRing, Loader2, Layers, Youtube } from "lucide-react";
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
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Test Overlay</CardTitle>
            <CardDescription className="mt-0.5">
              Send a dummy donation alert to your overlay to verify the design and sound
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          onClick={() => mutate({ creatorId })}
          disabled={isPending}
          className="w-full sm:w-auto justify-start"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BellRing className="mr-2 h-4 w-4" />
          )}
          Send Standard Test Alert
        </Button>
        <Button
          onClick={handleSpam}
          disabled={isPending}
          variant="secondary"
          className="w-full sm:w-auto justify-start"
        >
          <Layers className="mr-2 h-4 w-4" />
          Test Queue (Send 3x)
        </Button>
        <Button
          onClick={() => mutate({
            creatorId,
            mediaUrl: "https://www.youtube.com/watch?v=HfWLgELllZs&list=RDHfWLgELllZs&start_radio=1",
            mediaDuration: 15
          })}
          disabled={isPending}
          variant="outline"
          className="w-full sm:w-auto justify-start border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/10"
        >
          <Youtube className="mr-2 h-4 w-4 text-red-500" />
          Test Media Share
        </Button>
      </CardContent>
    </Card>
  );
}
