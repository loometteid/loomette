import { redirect } from "next/navigation";
import { StepOneForm } from "@/components/features/onboarding/step-one-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingStepOnePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <StepOneForm email={user.email ?? ""} />;
}
