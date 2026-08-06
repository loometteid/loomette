"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogPopup } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  WEEKDAY_LABELS,
  dateKey,
  formatMonthYear,
  getMonthWeeks,
  todayParts,
} from "@/components/features/calendar/date-utils";

export function CalendarDateDialog({
  open,
  onOpenChange,
  onConfirm,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedKey: string) => void;
  saving: boolean;
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
      <DialogPopup className="gap-6">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium tracking-wide">
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
                className="text-muted-foreground text-center text-[0.65rem] font-medium tracking-wide"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {weeks.flatMap((week, weekIndex) =>
              week.map((cell, cellIndex) => {
                if (!cell) {
                  return (
                    <div
                      key={`${weekIndex}-${cellIndex}`}
                      aria-hidden
                    />
                  );
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
                          ? "bg-foreground text-background border-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-border",
                      )}
                    >
                      {cell.day}
                    </button>
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(selectedKey)}
          disabled={saving}
          className="bg-foreground text-background w-full rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
        >
          Save
        </button>
      </DialogPopup>
    </Dialog>
  );
}
