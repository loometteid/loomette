"use client";

import { useState } from "react";
import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const REASONS = [
  "I don't use it enough",
  "It's missing features I need",
  "It's too complicated",
  "I have privacy concerns",
  "I found something better",
] as const;

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (data?: { reasons: string[]; feedback?: string }) => void | Promise<void>;
  isDeleting?: boolean;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [confirmText, setConfirmText] = useState("");

  function handleReset() {
    setStep(1);
    setSelectedReasons([]);
    setFeedback("");
    setConfirmText("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      handleReset();
    }
    onOpenChange(nextOpen);
  }

  function toggleReason(reason: string) {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    );
  }

  const isConfirmed = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup
        data-testid="delete-account-dialog"
        className="max-w-md p-8 flex flex-col items-center gap-6"
        aria-describedby="delete-account-description"
      >
        {/* Progress Bar (3 segments) */}
        <div className="flex w-36 h-1.5 rounded-full overflow-hidden bg-[#F2EDE5] mt-1">
          <div
            className={cn(
              "h-full transition-all duration-300 bg-[#383733]",
              step === 1 && "w-1/3",
              step === 2 && "w-2/3",
              step === 3 && "w-full",
            )}
          />
        </div>

        {/* Step 1: Warning */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <div className="flex flex-col items-center gap-2">
              <DialogTitle className="font-serif text-[32px] md:text-[44px] font-normal leading-tight text-foreground">
                Before you go.
              </DialogTitle>
              <DialogDescription
                id="delete-account-description"
                className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase max-w-xs leading-relaxed"
              >
                Deleting your account removes everything — your wardrobe, outfit
                history, and profile. This can&apos;t be undone.
              </DialogDescription>
            </div>

            <div className="flex flex-col items-center gap-1.5 py-1">
              <span className="font-sans text-xs font-normal tracking-wider text-foreground underline uppercase underline-offset-4">
                What you&apos;ll lose
              </span>
              <span className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase">
                All wardrobe items
              </span>
              <span className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase">
                Your full outfit history
              </span>
              <span className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase">
                Your profile and preferences
              </span>
            </div>

            <div className="flex flex-col w-full gap-3 pt-2">
              <Button
                type="button"
                data-testid="delete-account-dialog__continue-step-1"
                onClick={() => setStep(2)}
                className="w-full bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
              >
                Continue to delete
              </Button>
              <Button
                type="button"
                data-testid="delete-account-dialog__cancel-step-1"
                onClick={() => handleOpenChange(false)}
                className="w-full bg-[#383733] hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
              >
                Keep my account
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Reason Survey */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <div className="flex flex-col items-center gap-2">
              <DialogTitle className="font-serif text-[32px] md:text-[44px] font-normal leading-tight text-foreground">
                What&apos;s not working?
              </DialogTitle>
              <DialogDescription className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase max-w-xs">
                Your answer helps us make Loomette better.
              </DialogDescription>
            </div>

            <div className="flex flex-col items-start w-full gap-3 px-2">
              {REASONS.map((reason) => {
                const checked = selectedReasons.includes(reason);
                return (
                  <label
                    key={reason}
                    className="flex items-center gap-3 font-sans text-xs font-normal tracking-wide text-foreground cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleReason(reason)}
                      className="size-4.5 rounded-md"
                    />
                    <span>{reason}</span>
                  </label>
                );
              })}
            </div>

            <Input
              data-testid="delete-account-dialog__feedback-input"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more (optional)"
              className="bg-[#F2EDE5] border-transparent font-sans text-xs text-foreground placeholder:text-muted-foreground rounded-xl py-3"
            />

            <div className="flex flex-col w-full gap-3 pt-2">
              <Button
                type="button"
                data-testid="delete-account-dialog__continue-step-2"
                onClick={() => setStep(3)}
                className="w-full bg-[#383733] hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
              >
                Continue to delete
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <div className="flex flex-col items-center gap-2">
              <DialogTitle className="font-serif text-[32px] md:text-[44px] font-normal leading-tight text-foreground">
                Are you sure?
              </DialogTitle>
              <DialogDescription className="font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase max-w-xs leading-relaxed">
                Type DELETE to confirm. Your account will be permanently removed
                within 30 days.
              </DialogDescription>
            </div>

            <Input
              data-testid="delete-account-dialog__confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="bg-[#F2EDE5] border-transparent text-xs text-center text-foreground placeholder:text-muted-foreground rounded-xl py-3 tracking-widest uppercase font-mono"
            />

            <div className="flex flex-col w-full gap-3 pt-2">
              <Button
                type="button"
                data-testid="delete-account-dialog__cancel-step-3"
                disabled={isDeleting}
                onClick={() => handleOpenChange(false)}
                className="w-full bg-[#383733] hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none"
              >
                Never mind
              </Button>
              <Button
                type="button"
                data-testid="delete-account-dialog__submit-button"
                disabled={!isConfirmed || isDeleting}
                onClick={() =>
                  onConfirmDelete({
                    reasons: selectedReasons,
                    feedback: feedback.trim() || undefined,
                  })
                }
                className="w-full bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none disabled:opacity-40"
              >
                {isDeleting ? "Deleting…" : "Delete my account"}
              </Button>
            </div>
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
}
