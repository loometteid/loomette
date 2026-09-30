import { redirect } from "next/navigation";
import { NotificationsView } from "@/domains/home/notifications-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return <NotificationsView />;
}
