
import { api } from "@/trpc/client";

import { toast } from "sonner";

export const useDonationHistory = (creatorId: string, page: number = 1, limit: number = 15) => {
  return api.donation.getHistory.useQuery({
    creatorId,
    page,
    limit
  }, {
    enabled: !!creatorId
  });
};

export const useReplayAlert = () => {
  return api.donation.replayAlert.useMutation({
    onSuccess: () => {
      toast.success("Alert replayed successfully!");
    },
    onError: (err) => {
      toast.error("Failed to replay alert", {
        description: err.message
      });
    }
  });
};
