"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-fit"),
        months: cn(
          defaultClassNames.months,
          "relative flex flex-col gap-4 sm:flex-row",
        ),
        month: cn(defaultClassNames.month, "space-y-4"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "relative flex h-8 items-center justify-center pt-1 text-sm font-semibold text-foreground",
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "inline-flex items-center gap-1 text-sm font-medium text-foreground px-2 py-0.5 rounded-lg hover:bg-muted/80 transition-colors select-none",
        ),
        dropdowns: cn(
          defaultClassNames.dropdowns,
          "relative inline-flex items-center justify-center gap-1.5",
        ),
        dropdown_root: cn(
          defaultClassNames.dropdown_root,
          "relative inline-flex items-center",
        ),
        dropdown: cn(
          defaultClassNames.dropdown,
          "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none",
        ),
        months_dropdown: cn(
          defaultClassNames.months_dropdown,
          "cursor-pointer",
        ),
        years_dropdown: cn(defaultClassNames.years_dropdown, "cursor-pointer"),
        chevron: cn(
          defaultClassNames.chevron,
          "size-3.5 text-muted-foreground shrink-0",
        ),
        nav: cn(defaultClassNames.nav, "flex items-center gap-1"),
        button_previous: cn(
          defaultClassNames.button_previous,
          "absolute left-1 top-0 size-7 flex items-center justify-center rounded-lg border border-border bg-background p-0 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-20",
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "absolute right-1 top-0 size-7 flex items-center justify-center rounded-lg border border-border bg-background p-0 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-20",
        ),
        weeks: cn(defaultClassNames.weeks, "w-full border-collapse space-y-1"),
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(
          defaultClassNames.weekday,
          "w-9 text-center text-xs font-medium text-muted-foreground uppercase",
        ),
        week: cn(defaultClassNames.week, "mt-1 flex w-full"),
        day: cn(
          defaultClassNames.day,
          "size-9 p-0 text-center text-sm font-normal text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ),
        day_button: cn(
          defaultClassNames.day_button,
          "size-9 flex items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground",
        ),
        selected: cn(
          defaultClassNames.selected,
          "[&>.rdp-day_button]:bg-primary [&>.rdp-day_button]:text-primary-foreground [&>.rdp-day_button]:hover:bg-primary/90 font-medium",
        ),
        today: cn(
          defaultClassNames.today,
          "font-bold underline underline-offset-4",
        ),
        outside: cn(
          defaultClassNames.outside,
          "text-muted-foreground/40 opacity-50",
        ),
        disabled: cn(
          defaultClassNames.disabled,
          "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
        ),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft
                className={cn("size-4", chevronClassName)}
                {...chevronProps}
              />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRight
                className={cn("size-4", chevronClassName)}
                {...chevronProps}
              />
            );
          }
          if (orientation === "down") {
            return (
              <ChevronDown
                className={cn("size-3.5 text-muted-foreground ml-0.5", chevronClassName)}
                {...chevronProps}
              />
            );
          }
          return (
            <ChevronUp
              className={cn("size-3.5 text-muted-foreground ml-0.5", chevronClassName)}
              {...chevronProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
