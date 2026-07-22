"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MONTH_LABELS } from "./date-utils";

export function MonthPickerDialog({
  open,
  onOpenChange,
  year,
  month,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
}) {
  const [pickerYear, setPickerYear] = useState(year);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setPickerYear(year);
        onOpenChange(next);
      }}
    >
      <DialogPopup>
        <DialogTitle>Select month</DialogTitle>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setPickerYear((y) => y - 1)}
            aria-label="Previous year"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-serif text-h1">{pickerYear}</span>
          <button
            type="button"
            onClick={() => setPickerYear((y) => y + 1)}
            aria-label="Next year"
            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTH_LABELS.map((label, index) => {
            const isActive = pickerYear === year && index === month;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  onSelect(pickerYear, index);
                  onOpenChange(false);
                }}
                className={cn(
                  "rounded-xl border border-border px-3 py-3 text-sm font-medium tracking-wide uppercase transition-colors",
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-border",
                )}
              >
                {label.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </DialogPopup>
    </Dialog>
  );
}
