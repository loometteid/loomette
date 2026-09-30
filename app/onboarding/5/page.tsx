import { redirect } from "next/navigation";
import { StepFiveForm } from "@/domains/onboarding/step-five-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingStepFivePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepFiveForm />;
}
