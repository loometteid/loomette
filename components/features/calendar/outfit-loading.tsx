"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { processOutfitPhotoMutationOptions } from "./mutation-options/process-outfit-photo.mutation-option.client";

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

  const isMountedRef = useRef(true);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { mutate: processPhoto } = useMutation({
    ...processOutfitPhotoMutationOptions(),
    async onSuccess(result) {
      const elapsed = Date.now() - startedAtRef.current;
      if (elapsed < MIN_DURATION_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_DURATION_MS - elapsed),
        );
      }
      if (!isMountedRef.current) return;
      clearInterval(tickRef.current);
      setPercent(100);
      setResult(result);
      router.push("/calendar/outfit-approval");
    },
    onError() {
      if (!isMountedRef.current) return;
      clearInterval(tickRef.current);
      toast.error("Couldn't process that photo.");
      reset();
      router.replace("/calendar");
    },
  });

  const process = useEffectEvent(() => {
    if (!draft) {
      router.replace("/calendar");
      return;
    }

    isMountedRef.current = true;
    startedAtRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setPercent(Math.min(99, Math.round((elapsed / MIN_DURATION_MS) * 100)));
    }, 100);

    processPhoto({
      userId: draft.userId,
      file: draft.file,
    });

  })

  useEffect(() => {
    process();

    return () => {
      isMountedRef.current = false;
      clearInterval(tickRef.current);
    };
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
            isMountedRef.current = false;
            clearInterval(tickRef.current);
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
