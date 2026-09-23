"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, History } from "lucide-react";
import { toast } from "sonner";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import getMonthDiaryEntries from "./server-functions/get-month-diary-entries.server-function";
import { CalendarGrid } from "./calendar-grid";
import { MonthPickerDialog } from "./month-picker-dialog";
import { OutfitEntryDialog } from "./outfit-entry-dialog";
import {
  dateKey,
  formatMonthYear,
  todayParts,
} from "./date-utils";
import type { DiaryEntry } from "./types";
import revalidateCalendarCache from "./server-functions/revalidate-calendar-cache.server-function";

// Rows must already be ordered latest-created-first per date -- this
// keeps the first occurrence per date, i.e. the most recent entry.
// `new Map(pairs)` looks equivalent but isn't: the Map constructor
// keeps the *last* pair for a repeated key, which would silently pick
// the oldest entry instead whenever two outfits are logged for the
// same day.
function dedupeByDate(rows: DiaryEntry[]) {
  const map = new Map<string, DiaryEntry>();
  for (const row of rows) {
    if (!map.has(row.worn_on)) map.set(row.worn_on, row);
  }
  return map;
}

async function fetchMonthEntries(
  userId: string,
  year: number,
  month: number,
) {
  const entries = await getMonthDiaryEntries(userId, year, month);
  return dedupeByDate(entries);
}

const subscribeNoop = () => () => {};

function getClientTodayKey() {
  const { year, month, day } = todayParts();
  return dateKey(year, month, day);
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

  // Safely sync with browser's clock/timezone across hydration:
  // useEffect-free hydration resolution
  const todayKey = useSyncExternalStore(
    subscribeNoop,
    getClientTodayKey,
    () => initialTodayKey,
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

  const [entriesByDate, setEntriesByDate] = useState<Map<string, DiaryEntry>>(
    () => dedupeByDate(initialEntries),
  );
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [openEntry, setOpenEntry] = useState<DiaryEntry | null>(null);
  const fetchToken = useRef(0);

  function goToToday() {
    setUserViewedYear(null);
    setUserViewedMonth(null);
    setUserSelectedKey(null);
  }

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
    void revalidateCalendarCache(userId);

    const entry: DiaryEntry = {
      id: saved.wearLogId,
      worn_on: saved.wornOn,
      // This merge only ever runs for the photo-upload flow (Mix &
      // Match's "Add to Calendar" arrives via a full navigation, so it
      // reads its entry straight from the server query instead) --
      // there's never a composition to attach here.
      outfit: { id: saved.outfitId, cover_image_url: saved.coverImageUrl, items: [] },
    };

    const [yearStr, monthStr] = saved.wornOn.split("-");
    const entryYear = Number(yearStr);
    const entryMonth = Number(monthStr) - 1;

    if (entryYear !== initialYear || entryMonth !== initialMonth) {
      setUserViewedYear(entryYear);
      setUserViewedMonth(entryMonth);
      setEntriesByDate(new Map([[entry.worn_on, entry]]));
    } else {
      setEntriesByDate((prev) => new Map(prev).set(entry.worn_on, entry));
    }
    setUserSelectedKey(entry.worn_on);
  }, [initialYear, initialMonth, userId]);
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
          setUserViewedYear(year);
          setUserViewedMonth(month);
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
