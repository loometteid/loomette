"use client";

import { cn } from "@/lib/utils";

export function PillToggleGroup({
  options,
  isSelected,
  onToggle,
}: {
  options: readonly { value: string; label: string }[];
  isSelected: (value: string) => boolean;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(option.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-medium tracking-wide uppercase transition-colors",
            isSelected(option.value)
              ? "border-foreground text-foreground border-2"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
