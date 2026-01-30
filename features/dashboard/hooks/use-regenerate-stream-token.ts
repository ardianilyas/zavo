"use client";

import { api } from "@/trpc/client";
import { toast } from "sonner";

export function useRegenerateStreamToken() {
  return api.user.regenerateStreamToken.useMutation({
    onSuccess: () => {
      toast.success("Stream key regenerated!");
    },
    onError: (error) => {
      toast.error("Failed to regenerate key", {
        description: error.message,
      });
    },
  });
}
