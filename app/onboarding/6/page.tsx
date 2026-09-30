import { redirect } from "next/navigation";
import { StepSixComplete } from "@/domains/onboarding/step-six-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingStepSixPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepSixComplete />;
}
