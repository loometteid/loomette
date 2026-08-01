import { redirect } from "next/navigation";
import { SettingsView } from "@/components/features/profile/settings-view";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("user")
    .select("is_private")
    .eq("user_id", user.id)
    .single();

  return <SettingsView initialIsPrivate={profile?.is_private ?? false} />;
}
