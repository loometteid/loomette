import { notFound, redirect } from "next/navigation";
import { EditTripForm } from "@/components/features/trip/edit-trip-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: trip } = await supabase
    .from("trip")
    .select("id, name, start_date, end_date, season, travel_companion, user_id")
    .eq("id", id)
    .single();

  if (!trip || trip.user_id !== user.id) {
    notFound();
  }

  return (
    <EditTripForm
      trip={{
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        end_date: trip.end_date,
        season: trip.season,
        travel_companion: trip.travel_companion,
      }}
    />
  );
}
