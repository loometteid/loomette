import { OnboardingFallback } from "@/domains/onboarding/onboarding-loading";

export default function OnboardingStepOneLoading() {
  return <OnboardingFallback step={1} />;
}
