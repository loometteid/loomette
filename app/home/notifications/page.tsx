import { redirect } from "next/navigation";
import { NotificationsView } from "@/components/features/home/notifications-view";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return <NotificationsView />;
}
