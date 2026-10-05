'use client';

import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, History } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatMonthYear,
  getMonthWeeks,
  todayParts,
  type CalendarCell,
} from "./date-utils";

function FallbackCalendarGrid({
  weeks,
  todayDay,
}: {
  weeks: CalendarCell[][];
  todayDay?: number;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className={cn(
              "text-center text-[0.65rem] lg:text-xs font-semibold tracking-wider",
              label === "SUN" || label === "SAT"
                ? "text-[#E07A7A]"
                : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 lg:gap-y-2">
        {weeks.flatMap((week, weekIndex) =>
          week.map((cell, cellIndex) => {
            if (!cell) {
              return (
                <div
                  key={`${weekIndex}-${cellIndex}`}
                  className="h-16 lg:h-24"
                  aria-hidden
                />
              );
            }

            const isToday = cell.day === todayDay;

            return (
              <div
                key={cell.key}
                className={cn(
                  "flex h-16 lg:h-24 flex-col items-center gap-1 rounded-xl p-1 text-center transition-colors",
                  isToday && "bg-foreground",
                )}
              >
                <span
                  className={cn(
                    "text-xs lg:text-sm",
                    isToday
                      ? "text-background font-medium"
                      : "text-foreground",
                  )}
                >
                  {cell.day}
                </span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function CalendarFallback() {
  const { year, month, day } = todayParts();
  const currentWeeks = getMonthWeeks(year, month);
  const nextMonth = addMonths(year, month, 1);
  const nextWeeks = getMonthWeeks(nextMonth.year, nextMonth.month);

  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-col gap-6 lg:gap-8 px-6 lg:px-12 py-8 lg:py-10">
      {/* Mobile Title */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Your <em className="italic underline">outfit</em> diary
          </Typography>
        </div>
        <div
          aria-hidden
          className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-xl opacity-60"
        >
          <History className="size-4" />
        </div>
      </div>

      {/* Desktop Title & Today Action */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkle className="size-7 text-foreground" />
          <Typography variant="title" as="h1" className="text-3xl font-serif">
            Your <em className="italic underline">outfit</em> diary
          </Typography>
        </div>
        <div
          aria-hidden
          className="bg-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider opacity-60 shadow-sm"
        >
          <History className="size-4" />
          Today
        </div>
      </div>

      {/* Mobile Month Selector & Grid */}
      <div className="flex items-center justify-center gap-1 self-center text-sm font-medium tracking-wide lg:hidden">
        {formatMonthYear(year, month)}
        <ChevronDown className="size-4" />
      </div>

      <div className="lg:hidden">
        <FallbackCalendarGrid weeks={currentWeeks} todayDay={day} />
      </div>

      {/* Desktop Dual-Month View (D.2 Calendar) */}
      <div className="hidden lg:flex items-start gap-4 xl:gap-8 w-full mt-4">
        <div
          aria-hidden
          className="mt-1 flex size-10 items-center justify-center rounded-xl bg-secondary opacity-60 shrink-0 shadow-sm"
        >
          <ChevronLeft className="size-5" />
        </div>

        <div className="grid grid-cols-2 gap-8 xl:gap-14 flex-1">
          {/* Left Month */}
          <div className="flex flex-col gap-4">
            <h2 className="text-center font-serif text-lg xl:text-xl font-semibold tracking-wider uppercase">
              {formatMonthYear(year, month)}
            </h2>
            <FallbackCalendarGrid weeks={currentWeeks} todayDay={day} />
          </div>

          {/* Right Month */}
          <div className="flex flex-col gap-4">
            <h2 className="text-center font-serif text-lg xl:text-xl font-semibold tracking-wider uppercase">
              {formatMonthYear(nextMonth.year, nextMonth.month)}
            </h2>
            <FallbackCalendarGrid weeks={nextWeeks} />
          </div>
        </div>

        <div
          aria-hidden
          className="mt-1 flex size-10 items-center justify-center rounded-xl bg-secondary opacity-60 shrink-0 shadow-sm"
        >
          <ChevronRight className="size-5" />
        </div>
      </div>

      {/* Mobile Ingestion Card */}
      <div className="border-border flex flex-col gap-4 rounded-3xl border p-6 lg:hidden">
        <Typography variant="h1" as="h2">
          Capture your looks
        </Typography>

        <button
          type="button"
          disabled
          className="bg-foreground text-background flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full py-3 text-sm font-medium tracking-wide uppercase opacity-90"
        >
          Upload Outfit
        </button>

        <span className="text-muted-foreground self-center text-xs tracking-wide uppercase">
          or
        </span>

        <Link
          href="/mix-and-match"
          prefetch
          className="bg-secondary text-secondary-foreground flex w-full items-center justify-center rounded-full py-3 text-sm font-medium tracking-wide uppercase"
        >
          Mix &amp; Match
        </Link>
      </div>

      {/* Desktop Floating Actions (D.2 Calendar) */}
      <div className="hidden lg:flex fixed bottom-10 right-10 z-40 items-center gap-4 opacity-70">
        <div className="bg-[#EAE4DC] text-foreground px-6 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase shadow-lg">
          Mix &amp; Match
        </div>
        <div className="bg-[#393735] text-white px-7 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase shadow-lg">
          Upload Photo
        </div>
      </div>
    </main>
  );
}
