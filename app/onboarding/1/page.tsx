import { redirect } from "next/navigation";
import { StepOneForm } from "@/components/features/onboarding/step-one-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingStepOnePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // display_name (step 1) and gender (step 2) are the only two required
  // fields in the whole flow — steps 3-5 are all optional. Treat both
  // being set as "already onboarded" so returning users aren't sent
  // through the flow again on every sign-in.
  const { data: profile } = await supabase
    .from("user")
    .select("display_name, gender")
    .eq("user_id", user.id)
    .single();

  if (profile?.display_name && profile?.gender) {
    redirect("/onboarding/7");
  }

  return <StepOneForm email={user.email ?? ""} />;
}
