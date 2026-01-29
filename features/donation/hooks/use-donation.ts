
import { api } from "@/trpc/client";

export const useDonationHistory = (creatorId: string, page: number = 1, limit: number = 15) => {
  return api.donation.getHistory.useQuery({
    creatorId,
    page,
    limit
  }, {
    enabled: !!creatorId
  });
};
