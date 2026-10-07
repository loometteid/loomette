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
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, History } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { CalendarGrid } from "./components/calendar-grid";
import { MonthPickerDialog } from "./components/month-picker-dialog";
import { OutfitEntryDialog } from "./components/outfit-entry-dialog";
import { addMonths, dateKey, formatMonthYear, todayParts } from "./date-utils";
import type { DiaryEntry } from "./types";
import { getDiaryEntriesQueryOptionsForBrowser } from "./query-options/get-diary-entries.query-option.client";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { useOnboardingGuard } from "@/domains/onboarding/hooks/use-onboarding-guard";

const subscribeNoop = () => () => {};

function getClientTodayKey() {
  const { year, month, day } = todayParts();
  return dateKey(year, month, day);
}

export function CalendarView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  useOnboardingGuard(profile);

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

  // Primary month query
  const { data: entriesByDate } = useSuspenseQuery(
    getDiaryEntriesQueryOptionsForBrowser(userId, viewedYear, viewedMonth),
  );

  // Second month for desktop dual-month view (D.2 Calendar)
  const nextMonth = useMemo(
    () => addMonths(viewedYear, viewedMonth, 1),
    [viewedYear, viewedMonth],
  );

  const { data: nextMonthEntries } = useQuery(
    getDiaryEntriesQueryOptionsForBrowser(
      userId,
      nextMonth.year,
      nextMonth.month,
    ),
  );
  const nextMonthEntriesByDate = useMemo(
    () => nextMonthEntries ?? new Map<string, DiaryEntry>(),
    [nextMonthEntries],
  );

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [openEntry, setOpenEntry] = useState<DiaryEntry | null>(null);

  function goToToday() {
    setUserViewedYear(null);
    setUserViewedMonth(null);
    setUserSelectedKey(null);
  }

  function handlePrevMonth() {
    const prev = addMonths(viewedYear, viewedMonth, -1);
    setUserViewedYear(prev.year);
    setUserViewedMonth(prev.month);
  }

  function handleNextMonth() {
    const next = addMonths(viewedYear, viewedMonth, 1);
    setUserViewedYear(next.year);
    setUserViewedMonth(next.month);
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
      queryKey: getDiaryEntriesQueryOptionsForBrowser(
        userId,
        entryYear,
        entryMonth,
      ).queryKey,
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
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-col gap-6 lg:gap-8 px-6 lg:px-12 py-8 lg:py-10">
      <Link href="/calendar/loading" prefetch className="hidden" aria-hidden />
      <Link
        href="/calendar/outfit-approval"
        prefetch
        className="hidden"
        aria-hidden
      />

      {/* Mobile Title */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
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

      {/* Desktop Title & Today Action */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkle className="size-7 text-foreground" />
          <Typography variant="title" as="h1" className="text-3xl font-serif">
            Your <em className="italic underline">outfit</em> diary
          </Typography>
        </div>
        <button
          type="button"
          onClick={goToToday}
          aria-label="Jump to today"
          className="bg-secondary hover:bg-secondary/80 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <History className="size-4" />
          Today
        </button>
      </div>

      {/* Mobile Month Selector & Grid */}
      <button
        type="button"
        onClick={() => setMonthPickerOpen(true)}
        className="flex items-center justify-center gap-1 self-center text-sm font-medium tracking-wide lg:hidden"
      >
        {formatMonthYear(viewedYear, viewedMonth)}
        <ChevronDown className="size-4" />
      </button>

      <div className="lg:hidden">
        <CalendarGrid
          year={viewedYear}
          month={viewedMonth}
          todayKey={todayKey}
          selectedKey={selectedKey}
          entriesByDate={entriesByDate}
          onSelectDate={setUserSelectedKey}
          onOpenEntry={setOpenEntry}
        />
      </div>

      {/* Desktop Dual-Month View (D.2 Calendar) */}
      <div className="hidden lg:flex items-start gap-4 xl:gap-8 w-full mt-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="mt-1 flex size-10 items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors shrink-0 shadow-sm"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="grid grid-cols-2 gap-8 xl:gap-14 flex-1">
          {/* Left Month */}
          <div className="flex flex-col gap-4">
            <h2 className="text-center font-serif text-lg xl:text-xl font-semibold tracking-wider uppercase">
              {formatMonthYear(viewedYear, viewedMonth)}
            </h2>
            <CalendarGrid
              year={viewedYear}
              month={viewedMonth}
              todayKey={todayKey}
              selectedKey={selectedKey}
              entriesByDate={entriesByDate}
              onSelectDate={setUserSelectedKey}
              onOpenEntry={setOpenEntry}
            />
          </div>

          {/* Right Month */}
          <div className="flex flex-col gap-4">
            <h2 className="text-center font-serif text-lg xl:text-xl font-semibold tracking-wider uppercase">
              {formatMonthYear(nextMonth.year, nextMonth.month)}
            </h2>
            <CalendarGrid
              year={nextMonth.year}
              month={nextMonth.month}
              todayKey={todayKey}
              selectedKey={selectedKey}
              entriesByDate={nextMonthEntriesByDate}
              onSelectDate={setUserSelectedKey}
              onOpenEntry={setOpenEntry}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next month"
          className="mt-1 flex size-10 items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors shrink-0 shadow-sm"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Mobile Ingestion Card */}
      <div className="border border-[#EAE4DC] bg-[#FAF8F5]/60 flex flex-col gap-4 rounded-3xl p-6 lg:hidden">
        <Typography variant="h1" as="h2">
          Capture your looks
        </Typography>

        <label className="bg-[#393735] hover:bg-[#2b2a27] text-white flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 text-xs font-semibold tracking-wider uppercase shadow-md transition-transform active:scale-95">
          Upload Photo
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

        <span className="text-[#8C887B] self-center text-xs tracking-wider uppercase font-medium">
          or
        </span>

        <Link
          href="/mix-and-match"
          prefetch
          className="bg-[#EAE4DC] hover:bg-[#ded6cb] text-foreground flex w-full items-center justify-center rounded-2xl py-4 text-xs font-semibold tracking-wider uppercase shadow-sm transition-colors"
        >
          Mix &amp; Match
        </Link>
      </div>

      {/* Desktop Floating Actions (D.2 Calendar) */}
      <div className="hidden lg:flex fixed bottom-10 right-10 z-40 items-center gap-4">
        <Link
          href="/mix-and-match"
          prefetch
          className="bg-[#EAE4DC] hover:bg-[#dcd4c8] text-foreground px-6 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase shadow-lg transition-transform active:scale-95"
        >
          Mix &amp; Match
        </Link>
        <label className="bg-[#393735] hover:bg-[#2b2a27] text-white px-7 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase shadow-lg transition-transform cursor-pointer active:scale-95">
          Upload Photo
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
