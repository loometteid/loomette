"use client";

import Image from "next/image";
import { Sparkle, X } from "lucide-react";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import type { DiaryEntry } from "../types";

function formatEntryDate(worn_on: string) {
  const [year, month, day] = worn_on.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayStr = String(date.getDate()).padStart(2, "0");
  const monthStr = date.toLocaleDateString("en-US", { month: "short" });
  const yearStr = date.getFullYear();
  return `${dayStr} ${monthStr} ${yearStr}`;
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
      <DialogPopup
        showClose={false}
        className="fixed inset-0 m-auto h-fit max-w-[340px] lg:max-w-md w-[calc(100%-3rem)] p-6 lg:p-8 rounded-[24px] bg-[#FAFAF7] border-none text-center shadow-2xl relative"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-4 right-4 size-10 rounded-xl bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex items-center justify-center transition-colors"
        >
          <X className="size-4" />
        </button>

        {entry && (
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Sparkle className="size-5 text-[#444440]" />
              <DialogTitle className="font-serif text-2xl lg:text-3xl text-[#444440]">
                {formatEntryDate(entry.worn_on)}
              </DialogTitle>
            </div>

            {entry.outfit && entry.outfit.items.length > 0 ? (
              <div className="w-full flex flex-col items-center gap-3">
                <OutfitComposition
                  items={entry.outfit.items}
                  className="aspect-5/6 w-full max-w-[280px]"
                />
                <span className="font-serif text-lg text-[#444440]">
                  {entry.outfit.name || "Chic Kinda Day"}
                </span>
              </div>
            ) : (
              entry.outfit?.cover_image_url && (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="relative aspect-3/4 w-full max-w-[260px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#ECE7DF]">
                    <Image
                      src={entry.outfit.cover_image_url}
                      alt="Outfit worn"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-serif text-lg text-[#444440]">
                    {entry.outfit.name || "Chic Kinda Day"}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
}
