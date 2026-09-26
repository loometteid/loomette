import { notFound, redirect } from "next/navigation";
import { TripDetailView } from "@/components/features/trip/trip-detail-view";
import {
  DIARY_ENTRY_SELECT,
  toDiaryEntries,
  type RawDiaryRow,
} from "@/components/features/calendar/diary-query";
import { eachDateInRange } from "@/components/features/trip/trip-dates";
import type { Trip, TripDayOutfit } from "@/components/features/trip/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

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

  const days = eachDateInRange(trip.start_date, trip.end_date);

  const { data: rows } = await supabase
    .from("wear_log")
    .select(DIARY_ENTRY_SELECT)
    .eq("user_id", user.id)
    .in("worn_on", days)
    .order("worn_on", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<RawDiaryRow[]>();

  const entries = toDiaryEntries(rows ?? []);
  const outfitsByDay = new Map<string, TripDayOutfit[]>();
  for (const entry of entries) {
    if (!entry.outfit) continue;
    const list = outfitsByDay.get(entry.worn_on) ?? [];
    list.push({
      wearLogId: entry.id,
      outfitId: entry.outfit.id,
      items: entry.outfit.items,
    });
    outfitsByDay.set(entry.worn_on, list);
  }

  const tripData: Trip = {
    id: trip.id,
    name: trip.name,
    start_date: trip.start_date,
    end_date: trip.end_date,
    season: trip.season,
    travel_companion: trip.travel_companion,
  };

  return (
    <TripDetailView
      trip={tripData}
      days={days}
      outfitsByDay={Object.fromEntries(outfitsByDay)}
    />
  );
}
