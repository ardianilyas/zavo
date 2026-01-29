import { api } from "@/trpc/client";
import { toast } from "sonner";

export const useCreatorProfiles = () => {
  return api.creator.myProfiles.useQuery();
};

export const useCreateProfile = (onSuccess?: () => void) => {
  return api.creator.create.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully!");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error("Failed to create profile", { description: err.message });
    }
  });
};
