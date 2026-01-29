import { CreatorsView } from "@/features/creator/components/creators-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators | Zavo",
  description: "Manage your creator profiles",
};

export default function CreatorsPage() {
  return <CreatorsView />;
}
