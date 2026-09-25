"use server";

import { cacheLife, cacheTag } from "next/cache";
import { getCacheSupabaseClient } from "@/lib/supabase/cache";
import { monthRangeISO } from "../date-utils";
import {
  DIARY_ENTRY_SELECT,
  toDiaryEntries,
  type RawDiaryRow,
} from "../diary-query";
import type { DiaryEntry } from "../types";

export default async function getMonthDiaryEntries(
  userId: string,
  year: number,
  month: number,
): Promise<DiaryEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`diary-${userId}`, `diary-${userId}-${year}-${month}`);

  const { start, end } = monthRangeISO(year, month);
  const supabase = getCacheSupabaseClient();

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
    console.error("Error fetching diary entries in getMonthDiaryEntries:", error);
    return [];
  }

  return toDiaryEntries(rows ?? []);
}
