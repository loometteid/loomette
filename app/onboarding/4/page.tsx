import { redirect } from "next/navigation";
import { StepFourForm } from "@/components/features/onboarding/step-four-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingStepFourPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepFourForm />;
}
