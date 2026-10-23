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
      <DialogPopup
        showClose={false}
        className="max-w-md p-6 lg:p-8 relative gap-6"
        data-testid="calendar-date-dialog"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          data-testid="calendar-date-dialog__close-button"
          className="bg-linen hover:bg-linen-dark absolute top-4 right-4 flex size-10 items-center justify-center rounded-xl transition-colors cursor-pointer text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-center gap-6 pt-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            data-testid="calendar-date-dialog__prev-month"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span
            className="text-base font-medium tracking-wide text-foreground font-sans"
            data-testid="calendar-date-dialog__month-year"
          >
            {formatMonthYear(viewYear, viewMonth)}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            data-testid="calendar-date-dialog__next-month"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-muted-foreground text-center text-[0.7rem] font-medium tracking-wider uppercase font-sans"
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
                      data-testid="calendar-date-dialog__day"
                      data-entity-id={cell.key}
                      className={cn(
                        "flex size-9 lg:size-10 items-center justify-center rounded-xl text-xs lg:text-sm font-medium transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary text-white font-semibold shadow-sm"
                          : "text-foreground hover:bg-linen",
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
          data-testid="calendar-date-dialog__save-button"
          className="bg-primary hover:bg-primary/90 text-white w-full rounded-2xl h-12 lg:h-14 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer shadow-sm mt-2"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </DialogPopup>
    </Dialog>
  );
}
