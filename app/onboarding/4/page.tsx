import { redirect } from "next/navigation";
import { StepFourForm } from "@/components/features/onboarding/step-four-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingStepFourPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepFourForm />;
}
