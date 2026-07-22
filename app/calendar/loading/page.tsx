import { redirect } from "next/navigation";
import { OutfitLoading } from "@/components/features/calendar/outfit-loading";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarLoadingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <OutfitLoading />;
}
