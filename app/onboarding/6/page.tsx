import { redirect } from "next/navigation";
import { StepSixComplete } from "@/components/features/onboarding/step-six-complete";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingStepSixPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepSixComplete />;
}
