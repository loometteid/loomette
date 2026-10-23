"use client";

import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirmLogout,
  isLoggingOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmLogout: () => void | Promise<void>;
  isLoggingOut?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        data-testid="logout-dialog"
        className="max-w-md text-center p-8 flex flex-col items-center gap-6"
        aria-describedby="logout-description"
      >
        <div className="flex flex-col items-center gap-2 pt-2">
          <DialogTitle className="font-serif text-[32px] md:text-[44px] font-normal leading-tight text-foreground">
            Log Out?
          </DialogTitle>
          <DialogDescription
            id="logout-description"
            className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase max-w-xs leading-relaxed"
          >
            Your wardrobe will still be here when you come back.
          </DialogDescription>
        </div>

        <div className="flex flex-col w-full gap-3">
          <Button
            type="button"
            data-testid="logout-dialog__confirm"
            disabled={isLoggingOut}
            onClick={onConfirmLogout}
            className="w-full bg-linen hover:bg-linen-dark text-foreground font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
          >
            {isLoggingOut ? "Logging out…" : "Yes, log out"}
          </Button>
          <Button
            type="button"
            data-testid="logout-dialog__cancel"
            disabled={isLoggingOut}
            onClick={() => onOpenChange(false)}
            className="w-full bg-primary hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
          >
            Stay in
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
