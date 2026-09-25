import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "./calendar-view";
import { dateKey, todayParts } from "./date-utils";
import getMonthDiaryEntries from "./server-functions/get-month-diary-entries.server-function";

export async function CalendarContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { year, month, day } = todayParts();
  const todayKey = dateKey(year, month, day);

  const initialEntries = await getMonthDiaryEntries(user.id, year, month);

  return (
    <CalendarView
      userId={user.id}
      initialYear={year}
      initialMonth={month}
      initialTodayKey={todayKey}
      initialEntries={initialEntries}
    />
  );
}
