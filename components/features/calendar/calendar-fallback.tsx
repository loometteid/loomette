"use client";

import Link from "next/link";
import { ChevronDown, History } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  WEEKDAY_LABELS,
  formatMonthYear,
  getMonthWeeks,
  todayParts,
} from "./date-utils";

export function CalendarFallback() {
  const { year, month, day } = todayParts();
  const weeks = getMonthWeeks(year, month);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-2">
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

      <div className="flex items-center justify-center gap-1 self-center text-sm font-medium tracking-wide">
        {formatMonthYear(year, month)}
        <ChevronDown className="size-4" />
      </div>

      {/* Empty Calendar Grid */}
      <div className="flex w-full flex-col gap-2">
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((label) => (
            <span
              key={label}
              className="text-muted-foreground text-center text-[0.65rem] font-medium tracking-wide"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {weeks.flatMap((week, weekIndex) =>
            week.map((cell, cellIndex) => {
              if (!cell) {
                return (
                  <div
                    key={`${weekIndex}-${cellIndex}`}
                    className="h-16"
                    aria-hidden
                  />
                );
              }

              const isToday = cell.day === day;

              return (
                <div
                  key={cell.key}
                  className={cn(
                    "flex h-16 flex-col items-center gap-1 rounded-xl p-1 text-center transition-colors",
                    isToday && "bg-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs",
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

      <div className="border-border flex flex-col gap-4 rounded-3xl border p-6">
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
          className="bg-secondary text-secondary-foreground flex w-full items-center justify-center rounded-full py-3 text-sm font-medium tracking-wide uppercase"
        >
          Mix &amp; Match
        </Link>
      </div>
    </main>
  );
}
