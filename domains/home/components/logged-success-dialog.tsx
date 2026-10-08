"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";

export function LoggedSuccessDialog({
  open,
  onOpenChange,
  onOpenCalendar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCalendar?: () => void;
}) {
  const router = useRouter();

  function handleSeeCollections() {
    onOpenChange(false);
    router.push("/calendar/history");
  }

  function handleOpenCalendar() {
    onOpenChange(false);
    onOpenCalendar?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        showClose={false}
        className="max-w-sm w-[calc(100%-2rem)] rounded-3xl bg-[#FAFAF7] p-8 text-center shadow-2xl border-none"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="bg-secondary/70 hover:bg-secondary text-foreground absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative size-36">
            <Image
              src="/brand/mascot-image-43.png"
              alt="Hanger Mascot"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col gap-1">
            <DialogTitle className="font-serif text-3xl font-medium tracking-tight text-foreground">
              Logged.
            </DialogTitle>
            <p className="font-serif text-3xl font-medium tracking-tight text-foreground">
              <em className="italic underline">Love</em> this one.
            </p>
            <span className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase pt-2">
              YOUR LOOKS IS IN.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSeeCollections}
            className="w-full rounded-full bg-[#3B3A36] py-3.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black transition-colors"
          >
            See Collections
          </button>

          {onOpenCalendar && (
            <button
              type="button"
              onClick={handleOpenCalendar}
              className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors"
            >
              Or Add to <span className="underline">Calendar</span>
            </button>
          )}
        </div>
      </DialogPopup>
    </Dialog>
  );
}
