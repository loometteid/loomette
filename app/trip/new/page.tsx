import { redirect } from "next/navigation";
import { EditTripForm } from "@/components/features/trip/edit-trip-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewTripPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <EditTripForm />;
}
