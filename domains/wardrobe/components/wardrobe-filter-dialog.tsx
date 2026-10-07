"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkle } from "@/components/ui/sparkle";
import { cn } from "@/lib/utils";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  DATE_ADDED_OPTIONS,
  EMPTY_FILTERS,
  OCCASION_OPTIONS,
  TIMES_WORN_OPTIONS,
  getSubcategoryOptions,
  type DateAdded,
  type Gender,
  type Occasion,
  type TimesWorn,
  type WardrobeFilters,
} from "../types";

export function WardrobeFilterDialog({
  open,
  onOpenChange,
  filters,
  onApply,
  gender,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: WardrobeFilters;
  onApply: (filters: WardrobeFilters) => void;
  gender: Gender | null;
}) {
  const [draft, setDraft] = useState(filters);

  const subcategoryOptions = getSubcategoryOptions(draft.category, gender);

  function toggleColor(value: string) {
    setDraft((prev) => ({
      ...prev,
      colors: prev.colors.includes(value)
        ? prev.colors.filter((c) => c !== value)
        : [...prev.colors, value],
    }));
  }

  function toggleOccasion(value: Occasion) {
    setDraft((prev) => ({
      ...prev,
      occasions: prev.occasions.includes(value)
        ? prev.occasions.filter((o) => o !== value)
        : [...prev.occasions, value],
    }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters);
        onOpenChange(next);
      }}
    >
      <DialogPopup
        showClose={false}
        className="fixed inset-0 m-auto h-fit max-w-[340px] lg:max-w-3xl w-[calc(100%-2rem)] p-6 lg:p-8 rounded-[24px] bg-[#FAFAF7] border-none shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center gap-3">
          <DialogClose
            aria-label="Close"
            className="size-10 rounded-xl bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </DialogClose>
          <DialogTitle className="flex flex-1 items-center justify-center gap-2 text-2xl font-serif">
            <Sparkle className="size-4" />
            Filter
          </DialogTitle>
          <div className="size-8 shrink-0" aria-hidden />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-2">
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                Category
              </Label>
              <PillToggleGroup
                options={CATEGORY_OPTIONS}
                isSelected={(value) => draft.category === value}
                onToggle={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    category: prev.category === value ? null : value,
                    subcategory: null,
                  }))
                }
              />
            </div>

            {subcategoryOptions.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                  Sub Category
                </Label>
                <PillToggleGroup
                  options={subcategoryOptions}
                  isSelected={(value) => draft.subcategory === value}
                  onToggle={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      subcategory: prev.subcategory === value ? null : value,
                    }))
                  }
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                Colors
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={option.label}
                    onClick={() => toggleColor(option.value)}
                    style={{ backgroundColor: option.swatch }}
                    className={cn(
                      "size-8 rounded-full border-2 transition-colors",
                      draft.colors.includes(option.value)
                        ? "border-foreground"
                        : "border-border",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                Occasion
              </Label>
              <PillToggleGroup
                options={OCCASION_OPTIONS}
                isSelected={(value) =>
                  draft.occasions.includes(value as Occasion)
                }
                onToggle={(value) => toggleOccasion(value as Occasion)}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5 justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                  Times Worn
                </Label>
                <PillToggleGroup
                  options={TIMES_WORN_OPTIONS}
                  isSelected={(value) => draft.timesWorn === value}
                  onToggle={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      timesWorn:
                        prev.timesWorn === value ? null : (value as TimesWorn),
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                  Date Added
                </Label>
                <PillToggleGroup
                  options={DATE_ADDED_OPTIONS}
                  isSelected={(value) => draft.dateAdded === value}
                  onToggle={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      dateAdded:
                        prev.dateAdded === value ? null : (value as DateAdded),
                    }))
                  }
                />
              </div>
            </div>

            {/* Desktop Action Buttons aligned to bottom-right per Figma D.3.0.1 */}
            <div className="hidden lg:flex items-center justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                className="px-6 rounded-xl"
                onClick={() => setDraft(EMPTY_FILTERS)}
              >
                Reset
              </Button>
              <Button
                type="button"
                className="bg-[#444440] hover:bg-[#333330] text-white rounded-2xl py-3.5 px-10 text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
                onClick={() => {
                  onApply(draft);
                  onOpenChange(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex gap-3 lg:hidden mt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-2xl py-3.5 text-xs font-semibold uppercase tracking-wider"
            onClick={() => setDraft(EMPTY_FILTERS)}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="flex-1 bg-[#444440] hover:bg-[#333330] text-white rounded-2xl py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
