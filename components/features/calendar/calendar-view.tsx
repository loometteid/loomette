"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, History } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { CalendarGrid } from "./calendar-grid";
import { MonthPickerDialog } from "./month-picker-dialog";
import { OutfitEntryDialog } from "./outfit-entry-dialog";
import { dateKey, formatMonthYear, todayParts } from "./date-utils";
import type { DiaryEntry } from "./types";
import { getDiaryEntriesQueryOptionsForBrowser } from "./query-options/get-diary-entries.query-option.client";

const subscribeNoop = () => () => { };

function getClientTodayKey() {
  const { year, month, day } = todayParts();
  return dateKey(year, month, day);
}

export function CalendarView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Safely sync with browser's clock/timezone across hydration
  const todayKey = useSyncExternalStore(
    subscribeNoop,
    getClientTodayKey,
    getClientTodayKey,
  );

  const [todayYear, todayMonth] = useMemo(() => {
    const [y, m] = todayKey.split("-");
    return [Number(y), Number(m) - 1];
  }, [todayKey]);

  const [userViewedYear, setUserViewedYear] = useState<number | null>(null);
  const [userViewedMonth, setUserViewedMonth] = useState<number | null>(null);
  const [userSelectedKey, setUserSelectedKey] = useState<string | null>(null);

  // Derived state: defaults to today unless explicitly overridden by user
  const viewedYear = userViewedYear ?? todayYear;
  const viewedMonth = userViewedMonth ?? todayMonth;
  const selectedKey = userSelectedKey ?? todayKey;

  // TanStack Query with Suspense: loads and caches month data seamlessly
  console.log('sampai sini')
  const { data: entriesByDate } = useSuspenseQuery(
    getDiaryEntriesQueryOptionsForBrowser(userId, viewedYear, viewedMonth),
  );
  console.log('habis ini', entriesByDate)

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [openEntry, setOpenEntry] = useState<DiaryEntry | null>(null);

  function goToToday() {
    setUserViewedYear(null);
    setUserViewedMonth(null);
    setUserSelectedKey(null);
  }

  // Consume an entry saved by the /calendar/loading -> /calendar/
  // outfit-approval flow (stores/outfit-diary-upload-store.ts).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = useOutfitDiaryUploadStore.getState().savedEntry;
    if (!saved) return;
    useOutfitDiaryUploadStore.getState().clearSavedEntry();

    const [yearStr, monthStr] = saved.wornOn.split("-");
    const entryYear = Number(yearStr);
    const entryMonth = Number(monthStr) - 1;

    void queryClient.invalidateQueries({
      queryKey: getDiaryEntriesQueryOptionsForBrowser(userId, entryYear, entryMonth).queryKey
    });

    setUserViewedYear(entryYear);
    setUserViewedMonth(entryMonth);
    setUserSelectedKey(saved.wornOn);
  }, [userId, queryClient]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleFileSelected(file: File) {
    useOutfitDiaryUploadStore
      .getState()
      .startDraft({ userId, file, wornOn: selectedKey });
    router.push("/calendar/loading");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Your <em className="italic underline">outfit</em> diary
          </Typography>
        </div>
        <button
          type="button"
          onClick={goToToday}
          aria-label="Jump to today"
          className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-xl"
        >
          <History className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setMonthPickerOpen(true)}
        className="flex items-center justify-center gap-1 self-center text-sm font-medium tracking-wide"
      >
        {formatMonthYear(viewedYear, viewedMonth)}
        <ChevronDown className="size-4" />
      </button>

      <CalendarGrid
        year={viewedYear}
        month={viewedMonth}
        todayKey={todayKey}
        selectedKey={selectedKey}
        entriesByDate={entriesByDate}
        onSelectDate={setUserSelectedKey}
        onOpenEntry={setOpenEntry}
      />

      <div className="border-border flex flex-col gap-4 rounded-3xl border p-6">
        <Typography variant="h1" as="h2">
          Capture your looks
        </Typography>

        <label className="bg-foreground text-background flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3 text-sm font-medium tracking-wide uppercase">
          Upload Outfit
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) handleFileSelected(file);
            }}
          />
        </label>

        <span className="text-muted-foreground self-center text-xs tracking-wide uppercase">
          or
        </span>

        <Link
          href="/mix-and-match"
          className="bg-secondary text-secondary-foreground flex w-full items-center justify-center rounded-full py-3 text-sm font-medium tracking-wide uppercase"
        >
          Mix &amp; Match
        </Link>
      </div>

      <MonthPickerDialog
        open={monthPickerOpen}
        onOpenChange={setMonthPickerOpen}
        year={viewedYear}
        month={viewedMonth}
        onSelect={(year, month) => {
          startTransition(() => {
            setUserViewedYear(year);
            setUserViewedMonth(month);
          });
        }}
      />

      <OutfitEntryDialog
        entry={openEntry}
        onOpenChange={(open) => {
          if (!open) setOpenEntry(null);
        }}
      />
    </main>
  );
}
