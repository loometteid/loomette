import { redirect } from "next/navigation";
import { OutfitApproval } from "@/components/features/calendar/outfit-approval";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OutfitApprovalPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <OutfitApproval />;
}
