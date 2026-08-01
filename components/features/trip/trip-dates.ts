import { dateKey } from "@/components/features/calendar/date-utils";

/** Every date from start to end inclusive, as "YYYY-MM-DD" keys -- a
 * trip's "days" are never stored, just this range. */
export function eachDateInRange(startISO: string, endISO: string): string[] {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function formatDayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

const MONTH_ABBR = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export function formatTripMonthYear(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTH_ABBR[m - 1]} ${y}`;
}
