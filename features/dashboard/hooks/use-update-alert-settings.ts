"use client";

import { api } from "@/trpc/client";
import { toast } from "sonner";

interface UseUpdateAlertSettingsOptions {
  onError?: (error: any) => void;
}

export function useUpdateAlertSettings(options?: UseUpdateAlertSettingsOptions) {
  const utils = api.useUtils();

  return api.creator.updateSettings.useMutation({
    onSuccess: () => {
      utils.creator.myProfiles.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.(error);
    },
  });
}
