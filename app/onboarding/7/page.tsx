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

  // A returning user who already has a wardrobe item has effectively
  // finished onboarding -- every sign-in path (password, OAuth, email
  // OTP) lands here via /onboarding/1's own "profile already complete"
  // bounce, so this one check is enough to skip the upload screen for
  // all of them without duplicating it at each entry point. Counting
  // any row regardless of `is_approved`: the upload flow creates the
  // row before the user ever reaches the approval queue, so gating on
  // approval would send someone who just uploaded straight back here.
  const { count } = await supabase
    .from("wardrobe_item")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    redirect("/home");
  }

  return <AddInitialItem />;
}
