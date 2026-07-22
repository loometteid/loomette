"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS, getMonthWeeks } from "./date-utils";
import type { DiaryEntry } from "./types";

export function CalendarGrid({
  year,
  month,
  todayKey,
  selectedKey,
  entriesByDate,
  onSelectDate,
  onOpenEntry,
}: {
  year: number;
  month: number;
  todayKey: string;
  selectedKey: string;
  entriesByDate: Map<string, DiaryEntry>;
  onSelectDate: (key: string) => void;
  onOpenEntry: (entry: DiaryEntry) => void;
}) {
  const weeks = getMonthWeeks(year, month);

  return (
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

            const isSelected = cell.key === selectedKey;
            const isToday = cell.key === todayKey;
            const entry = entriesByDate.get(cell.key);
            const hasPhoto = !!entry?.outfit?.cover_image_url;

            return (
              <div
                key={cell.key}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDate(cell.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onSelectDate(cell.key);
                  }
                }}
                className={cn(
                  "flex h-16 cursor-pointer flex-col items-center gap-1 rounded-xl p-1 text-center transition-colors",
                  isSelected && !hasPhoto && "bg-foreground",
                )}
              >
                <span
                  className={cn(
                    "text-xs",
                    isSelected && !hasPhoto
                      ? "text-background font-medium"
                      : isToday
                        ? "text-foreground font-semibold"
                        : "text-foreground",
                  )}
                >
                  {cell.day}
                </span>
                {hasPhoto && entry && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenEntry(entry);
                    }}
                    className={cn(
                      "relative aspect-square w-full min-h-0 flex-1 overflow-hidden rounded-lg",
                      isSelected && "ring-2 ring-foreground ring-offset-1",
                    )}
                  >
                    <Image
                      src={entry.outfit!.cover_image_url!}
                      alt=""
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </button>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
