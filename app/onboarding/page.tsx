import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Become a Creator</CardTitle>
        <CardDescription>
          Register your public profile to start receiving donations and building your community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}
