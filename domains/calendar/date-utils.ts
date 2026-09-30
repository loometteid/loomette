export const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** `worn_on` is a plain date column ("YYYY-MM-DD") -- build keys from
 * local calendar parts directly rather than via `toISOString()`, which
 * would shift the date across a UTC day boundary. 
 */
export function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    /**
     * From 0 to 11
     */
    month: now.getMonth(),
    day: now.getDate(),
  };
}

export type CalendarCell = { day: number; key: string } | null;

/** Sunday-first week grid for the given month, padded with `null` cells
 * so every row has 7 columns and stays visually aligned. */
export function getMonthWeeks(year: number, month: number): CalendarCell[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, key: dateKey(year, month, day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * 
 * @param year 
 * @param month From 0 to 11
 * @returns 
 */
export function monthRangeISO(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    start: dateKey(year, month, 1),
    end: dateKey(year, month, daysInMonth),
  };
}

export function formatMonthYear(year: number, month: number) {
  return `${MONTH_LABELS[month].toUpperCase()} ${year}`;
}
