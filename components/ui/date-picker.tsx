"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";

export interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  outlined?: boolean;
  "data-testid"?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "DD / MM / YYYY",
  disabled = false,
  className,
  id,
  outlined,
  "data-testid": dataTestId,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse ISO date string (YYYY-MM-DD) into Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const displayString = selectedDate
    ? format(selectedDate, "dd / MM / yyyy")
    : "";

  function handleSelect(date: Date | undefined) {
    if (date && isValid(date)) {
      const iso = format(date, "yyyy-MM-dd");
      onChange?.(iso);
    } else {
      onChange?.("");
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        id={id}
        disabled={disabled}
        data-testid={dataTestId ?? "date-picker__trigger"}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border bg-secondary px-3.5 py-2 text-left text-sm transition-colors outline-none",
          outlined ? "border-black" : "border-transparent",
          "focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50",
          !displayString && "text-muted-foreground",
          className,
        )}
      >
        <span
          className={cn(
            "tracking-wider",
            !displayString && "text-muted-foreground/70",
          )}
        >
          {displayString || placeholder}
        </span>
        <CalendarIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate ?? new Date(2000, 0, 1)}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
