import { api } from "@/trpc/client";
import { toast } from "sonner";

export const useDonate = (onPaymentReady: (data: any) => void) => {
  return api.donation.create.useMutation({
    onSuccess: (data) => {
      onPaymentReady(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useSimulatePayment = (onSuccess: () => void) => {
  return api.donation.simulatePay.useMutation({
    onSuccess: () => {
      toast.success("Payment Simulated Successfully!");
      onSuccess();
    },
    onError: (err) => toast.error(err.message)
  });
};
