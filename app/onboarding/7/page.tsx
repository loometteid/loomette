import { redirect } from "next/navigation";
import { AddInitialItem } from "@/components/features/onboarding/add-initial-item";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingStepSevenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <AddInitialItem />;
}
