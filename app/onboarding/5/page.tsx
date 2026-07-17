import { redirect } from "next/navigation";
import { StepFiveForm } from "@/components/features/onboarding/step-five-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingStepFivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepFiveForm />;
}
