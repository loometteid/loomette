import { CalendarView } from "@/components/features/calendar/calendar-view";
import {
  dateKey,
  monthRangeISO,
} from "@/components/features/calendar/date-utils";
import type { DiaryEntry } from "@/components/features/calendar/types";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayKey = dateKey(year, month, now.getDate());
  const { start, end } = monthRangeISO(year, month);

  const { data: rows } = await supabase
    .from("wear_log")
    .select("id, worn_on, outfit:outfit_id(id, cover_image_url)")
    .eq("user_id", user.id)
    .gte("worn_on", start)
    .lte("worn_on", end)
    .order("worn_on", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<DiaryEntry[]>();

  return (
    <CalendarView
      userId={user.id}
      initialYear={year}
      initialMonth={month}
      initialTodayKey={todayKey}
      initialEntries={rows ?? []}
    />
  );
}
