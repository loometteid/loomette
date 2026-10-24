"use client";

import Image from "next/image";
import {
  Dialog,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AddToWardrobeDialog({
  item,
  open,
  onOpenChange,
  onAddToWardrobe,
  isPending,
}: {
  item: { id: string; name: string | null; image_url: string | null } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWardrobe: (item: { id: string; name: string | null }) => void | Promise<void>;
  isPending?: boolean;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        data-testid="add-to-wardrobe-dialog"
        className="max-w-md p-8 flex flex-col items-center gap-6 text-center"
      >
        <div className="relative aspect-square w-52 max-h-64 flex items-center justify-center overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name ?? ""}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="size-full bg-secondary rounded-2xl" />
          )}
        </div>

        <DialogTitle
          data-testid="add-to-wardrobe-dialog__title"
          className="font-serif text-2xl md:text-3xl font-normal leading-tight text-foreground"
        >
          {item.name ?? "Untitled"}
        </DialogTitle>

        <Button
          type="button"
          data-testid="add-to-wardrobe-dialog__confirm"
          disabled={isPending}
          onClick={() => onAddToWardrobe(item)}
          className="w-full max-w-xs bg-[#383733] hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
        >
          {isPending ? "Adding…" : "Add to wardrobe"}
        </Button>
      </DialogPopup>
    </Dialog>
  );
}
