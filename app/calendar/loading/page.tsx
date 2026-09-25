import { redirect } from "next/navigation";
import { OutfitLoading } from "@/components/features/calendar/outfit-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CalendarLoadingPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <OutfitLoading />;
}
