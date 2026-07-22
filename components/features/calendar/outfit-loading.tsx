"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { processOutfitPhoto } from "@/lib/outfitDiaryProcessing";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";

const MIN_DURATION_MS = 3000;

const STEPS = [
  { key: "uploaded", label: "Photo uploaded", atPercent: 35 },
  { key: "identified", label: "Outfit pieces identified", atPercent: 100 },
] as const;

export function OutfitLoading() {
  const router = useRouter();
  const draft = useOutfitDiaryUploadStore((state) => state.draft);
  const setResult = useOutfitDiaryUploadStore((state) => state.setResult);
  const reset = useOutfitDiaryUploadStore((state) => state.reset);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!draft) {
      router.replace("/calendar");
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    // Drives the visible progress % / checklist on a fixed clock,
    // independent of the real upload below -- this is exactly the piece
    // a real AI pipeline replaces later with actual progress events
    // (upload %, extraction status, ...) instead of a timer. Capped at
    // 99 so the UI never claims "done" before the real work is.
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setPercent(Math.min(99, Math.round((elapsed / MIN_DURATION_MS) * 100)));
    }, 100);

    processOutfitPhoto(draft.userId, draft.file)
      .then(async (result) => {
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_DURATION_MS) {
          await new Promise((resolve) =>
            setTimeout(resolve, MIN_DURATION_MS - elapsed),
          );
        }
        if (cancelled) return;
        clearInterval(tick);
        setPercent(100);
        setResult(result);
        router.push("/calendar/outfit-approval");
      })
      .catch(() => {
        if (cancelled) return;
        clearInterval(tick);
        toast.error("Couldn't process that photo.");
        reset();
        router.replace("/calendar");
      });

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col">
      <div className="px-6 pt-8">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={() => {
            reset();
            router.push("/calendar");
          }}
          aria-label="Cancel"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <div className="bg-muted mt-6 flex h-64 items-center justify-center">
        <Sparkle className="text-foreground/30 size-40" />
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center">
        <Typography variant="title" as="h1">
          <em className="italic">Generating</em> your gorgeous look.
        </Typography>

        <Typography variant="subtitle" className="max-w-xs">
          Hang on while we create this for your calendar.
        </Typography>

        <span className="text-lg font-bold">{percent}%</span>

        <div className="flex flex-col items-center gap-3">
          {STEPS.map((step) => {
            const done = percent >= step.atPercent;
            return (
              <div key={step.key} className="flex items-center gap-2">
                <Sparkle
                  className={cn(
                    "size-3.5",
                    done ? "text-foreground" : "text-muted-foreground/30",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium tracking-wide uppercase",
                    done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
