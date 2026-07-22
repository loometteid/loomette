"use client";

import Image from "next/image";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import type { DiaryEntry } from "./types";

function formatEntryDate(worn_on: string) {
  const [year, month, day] = worn_on.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function OutfitEntryDialog({
  entry,
  onOpenChange,
}: {
  entry: DiaryEntry | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogPopup>
        {entry && (
          <>
            <DialogTitle>{formatEntryDate(entry.worn_on)}</DialogTitle>
            {entry.outfit?.cover_image_url && (
              <div className="bg-secondary relative aspect-3/4 w-full overflow-hidden rounded-2xl">
                <Image
                  src={entry.outfit.cover_image_url}
                  alt="Outfit worn"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </>
        )}
      </DialogPopup>
    </Dialog>
  );
}
