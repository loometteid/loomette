import { redirect } from "next/navigation";
import { OutfitApproval } from "@/components/features/calendar/outfit-approval";
import { createClient } from "@/lib/supabase/server";

export default async function OutfitApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <OutfitApproval />;
}
