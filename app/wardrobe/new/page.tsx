import { redirect } from "next/navigation";
import { AddInitialItem } from "@/components/features/onboarding/add-initial-item";
import { createClient } from "@/lib/supabase/server";

export default async function AddWardrobeItemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Adding another item is independent of the first-item onboarding gate.
  return <AddInitialItem mode="wardrobe" />;
}
