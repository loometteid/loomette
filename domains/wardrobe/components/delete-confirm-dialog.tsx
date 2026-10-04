"use client";

import { Loader2, X } from "lucide-react";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";

export function DeleteConfirmDialog({
  open,
  count,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  count: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}) {
  const isMultiple = count > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        className="max-w-xs p-6 rounded-3xl bg-[#faf7f2] border-none text-center shadow-2xl"
        data-testid="delete-confirm-dialog"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded-full bg-[#eae4dc] p-1.5 text-foreground hover:opacity-80 transition-opacity"
            data-testid="delete-confirm-dialog__close-button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <DialogTitle
            data-testid="delete-confirm-dialog__title"
            className="font-serif text-2xl text-foreground"
          >
            {isMultiple ? "Delete items?" : "Delete item?"}
          </DialogTitle>
          <p className="text-[0.68rem] font-medium uppercase tracking-widest text-muted-foreground max-w-[200px] leading-relaxed">
            You will need to upload it again if you change your mind.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            data-testid="delete-confirm-dialog__confirm-button"
            className="bg-[#eae4dc] hover:bg-[#ded6cb] text-foreground flex w-full items-center justify-center rounded-2xl py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {isMultiple ? "Delete Items" : "Delete Item"}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            data-testid="delete-confirm-dialog__cancel-button"
            className="bg-[#393735] hover:bg-[#2b2a27] text-white flex w-full items-center justify-center rounded-2xl py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isMultiple ? "Keep Items" : "Keep Item"}
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
