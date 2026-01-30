"use client";

import { api } from "@/trpc/client";
import { toast } from "sonner";

export function useSendTestAlert() {
  return api.donation.sendTestAlert.useMutation({
    onSuccess: () => {
      toast.success("Test alert sent!", {
        description: "Check your overlay to see the notification.",
      });
    },
    onError: (error) => {
      toast.error("Failed to send test alert", {
        description: error.message,
      });
    },
  });
}
