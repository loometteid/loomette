import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DIARY_ENTRY_SELECT, toDiaryEntries, type RawDiaryRow } from "../diary-query";
import type { DiaryEntry } from "../types";

export const getOutfitsByDateQueryOptionsForServer = (
  userId: string,
  dateKey: string,
) =>
  queryOptions({
    queryKey: ["calendar", "outfits-by-date", userId, dateKey] as const,
    queryFn: async (): Promise<DiaryEntry[]> => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("wear_log")
        .select(DIARY_ENTRY_SELECT)
        .eq("user_id", userId)
        .eq("worn_on", dateKey)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return toDiaryEntries((data ?? []) as unknown as RawDiaryRow[]);
    },
  });
