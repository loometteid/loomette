"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogPopup } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  WEEKDAY_LABELS,
  dateKey,
  formatMonthYear,
  getMonthWeeks,
  todayParts,
} from "@/domains/calendar/date-utils";

export function RecommendationCalendarDialog({
  open,
  onOpenChange,
  onConfirm,
  onOpenCollection,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedKey: string) => void;
  onOpenCollection?: () => void;
  saving?: boolean;
}) {
  const today = todayParts();
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selectedKey, setSelectedKey] = useState(
    dateKey(today.year, today.month, today.day),
  );

  const weeks = getMonthWeeks(viewYear, viewMonth);

  function resetToToday() {
    const t = todayParts();
    setViewYear(t.year);
    setViewMonth(t.month);
    setSelectedKey(dateKey(t.year, t.month, t.day));
  }

  function goToPreviousMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) resetToToday();
        onOpenChange(next);
      }}
    >
      <DialogPopup showClose={false} className="max-w-sm w-[calc(100%-2rem)] rounded-3xl bg-[#FAFAF7] p-8 shadow-2xl border-none gap-6">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="bg-secondary/70 hover:bg-secondary text-foreground absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-center gap-6 pt-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-serif text-lg font-medium tracking-wide text-foreground uppercase">
            {formatMonthYear(viewYear, viewMonth)}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className={cn(
                  "text-center text-[0.65rem] font-medium tracking-wide uppercase",
                  label === "SUN" || label === "SAT" ? "text-rose-400" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {weeks.flatMap((week, weekIndex) =>
              week.map((cell, cellIndex) => {
                if (!cell) {
                  return <div key={`${weekIndex}-${cellIndex}`} aria-hidden />;
                }
                const isSelected = cell.key === selectedKey;
                return (
                  <div key={cell.key} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(cell.key)}
                      className={cn(
                        "border-border flex size-9 items-center justify-center rounded-xl border text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-[#3B3A36] text-white border-[#3B3A36]"
                          : "bg-secondary/50 text-secondary-foreground hover:bg-border",
                      )}
                    >
                      {String(cell.day).padStart(2, "0")}
                    </button>
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => onConfirm(selectedKey)}
            disabled={saving}
            className="w-full rounded-full bg-[#3B3A36] py-3.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {onOpenCollection && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenCollection();
              }}
              className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors"
            >
              Or Add to <span className="underline">Collections</span>
            </button>
          )}
        </div>
      </DialogPopup>
    </Dialog>
  );
}
