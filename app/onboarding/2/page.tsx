import { redirect } from "next/navigation";
import { StepTwoForm } from "@/components/features/onboarding/step-two-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingStepTwoPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepTwoForm />;
}
