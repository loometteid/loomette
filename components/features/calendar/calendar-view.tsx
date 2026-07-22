"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, History } from "lucide-react";
import { toast } from "sonner";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/client";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { CalendarGrid } from "./calendar-grid";
import { MonthPickerDialog } from "./month-picker-dialog";
import { OutfitEntryDialog } from "./outfit-entry-dialog";
import {
  dateKey,
  formatMonthYear,
  monthRangeISO,
  todayParts,
} from "./date-utils";
import type { DiaryEntry } from "./types";

async function fetchMonthEntries(
  userId: string,
  year: number,
  month: number,
) {
  const { start, end } = monthRangeISO(year, month);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wear_log")
    .select("id, worn_on, outfit:outfit_id(id, cover_image_url)")
    .eq("user_id", userId)
    .gte("worn_on", start)
    .lte("worn_on", end)
    .order("worn_on", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<DiaryEntry[]>();
  if (error) throw error;

  const map = new Map<string, DiaryEntry>();
  for (const row of data ?? []) {
    // Ordered latest-created-first per date -- first occurrence wins.
    if (!map.has(row.worn_on)) map.set(row.worn_on, row);
  }
  return map;
}

export function CalendarView({
  userId,
  initialYear,
  initialMonth,
  initialTodayKey,
  initialEntries,
}: {
  userId: string;
  initialYear: number;
  initialMonth: number;
  initialTodayKey: string;
  initialEntries: DiaryEntry[];
}) {
  const router = useRouter();
  const [viewedYear, setViewedYear] = useState(initialYear);
  const [viewedMonth, setViewedMonth] = useState(initialMonth);
  const [todayKey, setTodayKey] = useState(initialTodayKey);
  const [selectedKey, setSelectedKey] = useState(initialTodayKey);
  const [entriesByDate, setEntriesByDate] = useState<Map<string, DiaryEntry>>(
    () => new Map(initialEntries.map((entry) => [entry.worn_on, entry])),
  );
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [openEntry, setOpenEntry] = useState<DiaryEntry | null>(null);
  const fetchToken = useRef(0);

  // The server rendered with its own clock's notion of "today". Correct
  // for a mismatch (different timezone, or a request that straddled
  // midnight) after mount instead of reading the client's Date() during
  // the initial render, which would risk a hydration mismatch. This is
  // genuinely syncing with an external system (the browser's clock), not
  // recomputing derived state, so the setState-in-effect rule doesn't apply.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const client = todayParts();
    const clientKey = dateKey(client.year, client.month, client.day);
    if (clientKey === initialTodayKey) return;
    setTodayKey(clientKey);
    setSelectedKey((prev) => (prev === initialTodayKey ? clientKey : prev));
    setViewedYear(client.year);
    setViewedMonth(client.month);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Consume an entry saved by the /calendar/loading -> /calendar/
  // outfit-approval flow (stores/outfit-diary-upload-store.ts). That
  // flow lives on separate routes/pages, so it can't hand the new entry
  // back through React props/state -- it leaves it in the shared store
  // for the next Calendar mount to pick up and merge in immediately.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = useOutfitDiaryUploadStore.getState().savedEntry;
    if (!saved) return;
    useOutfitDiaryUploadStore.getState().clearSavedEntry();

    const entry: DiaryEntry = {
      id: saved.wearLogId,
      worn_on: saved.wornOn,
      outfit: { id: saved.outfitId, cover_image_url: saved.coverImageUrl },
    };

    const [yearStr, monthStr] = saved.wornOn.split("-");
    const entryYear = Number(yearStr);
    const entryMonth = Number(monthStr) - 1;

    if (entryYear !== initialYear || entryMonth !== initialMonth) {
      setViewedYear(entryYear);
      setViewedMonth(entryMonth);
      setEntriesByDate(new Map([[entry.worn_on, entry]]));
    } else {
      setEntriesByDate((prev) => new Map(prev).set(entry.worn_on, entry));
    }
    setSelectedKey(entry.worn_on);
  }, [initialYear, initialMonth]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isFirstRender = useRef(true);

  useEffect(() => {
    // The very first render already has its data from `initialEntries`
    // (fetched server-side) -- skip that one fetch. Every subsequent
    // change re-fetches unconditionally, including a return trip to the
    // starting month: `entriesByDate` has since been overwritten by
    // whatever month was viewed in between, so comparing against the
    // *initial* month here would wrongly skip refetching it.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const token = ++fetchToken.current;
    fetchMonthEntries(userId, viewedYear, viewedMonth)
      .then((map) => {
        if (fetchToken.current === token) setEntriesByDate(map);
      })
      .catch(() => {
        if (fetchToken.current === token) {
          toast.error("Couldn't load that month.");
        }
      });
  }, [userId, viewedYear, viewedMonth]);

  function goToToday() {
    const client = todayParts();
    const clientKey = dateKey(client.year, client.month, client.day);
    setViewedYear(client.year);
    setViewedMonth(client.month);
    setSelectedKey(clientKey);
  }

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
        onSelectDate={setSelectedKey}
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
          setViewedYear(year);
          setViewedMonth(month);
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
