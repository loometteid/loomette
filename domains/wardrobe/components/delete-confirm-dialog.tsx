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
        showClose={false}
        className="fixed inset-0 m-auto h-fit max-w-[320px] w-[calc(100%-3rem)] p-6 lg:p-8 rounded-[24px] bg-[#FAFAF7] border-none text-center shadow-2xl relative"
        data-testid="delete-confirm-dialog"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-4 right-4 size-10 rounded-xl bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex items-center justify-center transition-colors"
          data-testid="delete-confirm-dialog__close-button"
        >
          <X className="size-4" />
        </button>

        <div className="mt-4 flex flex-col items-center gap-2">
          <DialogTitle
            data-testid="delete-confirm-dialog__title"
            className="font-serif text-2xl text-[#444440]"
          >
            {isMultiple ? "Delete items?" : "Delete item?"}
          </DialogTitle>
          <p className="text-[0.68rem] font-medium uppercase tracking-widest text-[#78746D] max-w-[200px] leading-relaxed">
            You will need to upload it again if you change your mind.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            data-testid="delete-confirm-dialog__confirm-button"
            className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex w-full items-center justify-center rounded-2xl py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
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
            className="bg-[#444440] hover:bg-[#333330] text-white flex w-full items-center justify-center rounded-2xl py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isMultiple ? "Keep Items" : "Keep Item"}
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
