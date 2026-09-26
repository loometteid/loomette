import { CalendarView } from "@/components/features/calendar/calendar-view";
import {
  dateKey,
  monthRangeISO,
} from "@/components/features/calendar/date-utils";
import {
  DIARY_ENTRY_SELECT,
  toDiaryEntries,
  type RawDiaryRow,
} from "@/components/features/calendar/diary-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = await createServerSupabaseClient();

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
    .select(DIARY_ENTRY_SELECT)
    .eq("user_id", user.id)
    .gte("worn_on", start)
    .lte("worn_on", end)
    .order("worn_on", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<RawDiaryRow[]>();

  return (
    <CalendarView
      userId={user.id}
      initialYear={year}
      initialMonth={month}
      initialTodayKey={todayKey}
      initialEntries={toDiaryEntries(rows ?? [])}
    />
  );
}
