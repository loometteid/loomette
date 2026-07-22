import { redirect } from "next/navigation";
import { MixAndMatch } from "@/components/features/calendar/mix-and-match";
import { createClient } from "@/lib/supabase/server";

export default async function MixAndMatchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <MixAndMatch />;
}
