"use client";

import { api } from "@/trpc/client";
import { toast } from "sonner";

export function useReplayAlert() {
  return api.donation.replayAlert.useMutation({
    onSuccess: () => {
      toast.success("Alert replayed!", {
        description: "Check your overlay to see the notification.",
      });
    },
    onError: (error) => {
      toast.error("Failed to replay alert", {
        description: error.message,
      });
    },
  });
}
