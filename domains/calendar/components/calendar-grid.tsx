"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { WEEKDAY_LABELS, getMonthWeeks } from "../date-utils";
import type { DiaryEntry } from "../types";

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

            const isSelected = cell.key === selectedKey;
            const isToday = cell.key === todayKey;
            const entry = entriesByDate.get(cell.key);
            const items = entry?.outfit?.items ?? [];
            const hasComposition = items.length > 0;
            const hasPhoto = hasComposition || !!entry?.outfit?.cover_image_url;

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
                  "flex h-16 lg:h-24 cursor-pointer flex-col items-center gap-1 rounded-xl p-1 text-center transition-colors",
                  isSelected && !hasPhoto && "bg-[#393735] text-white",
                )}
              >
                <span
                  className={cn(
                    "text-xs lg:text-sm",
                    isSelected && !hasPhoto
                      ? "text-white font-medium"
                      : isToday
                        ? "text-foreground font-semibold"
                        : "text-foreground",
                  )}
                >
                  {String(cell.day).padStart(2, "0")}
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
                    {hasComposition ? (
                      <OutfitComposition
                        items={items}
                        imageSizes="60px"
                        className="h-full w-full"
                      />
                    ) : (
                      <Image
                        src={entry.outfit!.cover_image_url!}
                        alt=""
                        fill
                        sizes="60px"
                        className="object-contain"
                      />
                    )}
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
