import { redirect } from "next/navigation";
import { StepThreeForm } from "@/components/features/onboarding/step-three-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingStepThreePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepThreeForm />;
}
