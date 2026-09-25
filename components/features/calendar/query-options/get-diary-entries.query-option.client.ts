import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { monthRangeISO } from "../date-utils";
import {
  DIARY_ENTRY_SELECT,
  toDiaryEntries,
  type RawDiaryRow,
} from "../diary-query";
import type { DiaryEntry } from "../types";

function dedupeByDate(rows: DiaryEntry[]): Map<string, DiaryEntry> {
  const map = new Map<string, DiaryEntry>();
  for (const row of rows) {
    if (!map.has(row.worn_on)) map.set(row.worn_on, row);
  }
  return map;
}

/**
 * 
 * @param userId 
 * @param year 
 * @param month From 0 to 11
 * @returns 
 */
export const getDiaryEntriesQueryOptionsForBrowser = (
  userId: string,
  year: number,
  month: number,
) =>
  queryOptions({
    queryKey: ["diary", userId, year, month] as const,
    queryFn: async () => {
      const { start, end } = monthRangeISO(year, month);
      const supabase = createBrowserSupabaseClient();


      const { data: rows, error } = await supabase
        .from("wear_log")
        .select(DIARY_ENTRY_SELECT)
        .eq("user_id", userId)
        .gte("worn_on", start)
        .lte("worn_on", end)
        .order("worn_on", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<RawDiaryRow[]>();

      if (error) {
        console.error("Error fetching diary entries in getDiaryEntriesQueryOptionsForBrowser:", error);
        return new Map<string, DiaryEntry>();
      }

      return dedupeByDate(toDiaryEntries(rows ?? []));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
