import { api } from "@/trpc/client";
import { toast } from "sonner";

export const useWithdraw = (onSuccess?: () => void) => {
  return api.payout.request.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request submitted!");
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error("Failed to submit withdrawal", { description: err.message });
    }
  });
};

export const useTransactionHistory = (creatorId: string, limit?: number, page?: number) => {
  return api.payout.getHistory.useQuery({ creatorId, limit, page }, {
    enabled: !!creatorId
  });
};

export const useWithdrawalHistory = (creatorId: string, limit?: number, page?: number) => {
  return api.payout.getWithdrawals.useQuery({
    creatorId,
    limit,
    page,
  }, {
    enabled: !!creatorId
  });
};
