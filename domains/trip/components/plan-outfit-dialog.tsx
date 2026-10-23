"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  Dialog,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { toast } from "sonner";

interface PlanOutfitDialogProps {
  tripId: string;
  day: string | null;
  dayIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanOutfitDialog({
  tripId,
  day,
  open,
  onOpenChange,
}: PlanOutfitDialogProps) {
  if (!day) return null;

  const mixAndMatchUrl = `/mix-and-match?tripId=${tripId}&day=${day}&returnTo=${encodeURIComponent(`/trip/${tripId}`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        data-testid="plan-outfit-dialog"
        className="max-w-md p-8 sm:p-10 flex flex-col items-center gap-6 text-center bg-background border border-linen-dark rounded-3xl"
      >
        <div className="flex flex-col items-center gap-3 pt-2">
          <DialogTitle
            data-testid="plan-outfit-dialog__title"
            className="font-serif text-[28px] sm:text-[32px] font-normal leading-tight text-foreground max-w-xs"
          >
            Planning outfits for your day?
          </DialogTitle>
          <Typography
            variant="subtitle"
            className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground max-w-xs leading-relaxed"
          >
            Pick how you want to build your travel looks.
          </Typography>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2">
          <Link
            href={mixAndMatchUrl as Route}
            onClick={() => onOpenChange(false)}
            data-testid="plan-outfit-dialog__mix-and-match"
            className="w-full bg-linen hover:bg-linen-dark text-foreground font-sans text-xs sm:text-sm font-normal tracking-wider uppercase py-4 rounded-2xl transition-colors text-center shadow-xs"
          >
            Mix & Match
          </Link>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              toast.info("Wardrobe collection selection coming soon!");
            }}
            data-testid="plan-outfit-dialog__pick-collection"
            className="w-full bg-linen hover:bg-linen-dark text-foreground font-sans text-xs sm:text-sm font-normal tracking-wider uppercase py-4 rounded-2xl transition-colors text-center shadow-xs"
          >
            Pick Collection
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
