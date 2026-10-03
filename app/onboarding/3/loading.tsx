import { OnboardingFallback } from "@/domains/onboarding/onboarding-loading";

export default function OnboardingStepThreeLoading() {
  return <OnboardingFallback step={3} />;
}
