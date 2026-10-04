"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { cn } from "@/lib/utils";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { processOutfitPhotoMutationOptions } from "./mutation-options/process-outfit-photo.mutation-option.client";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import sootSpriteImage from "@/domains/auth/assets/soot-sprite.png";

const MIN_DURATION_MS = 3000;

const STEPS = [
  { key: "uploaded", label: "Photo uploaded", atPercent: 35 },
  { key: "identified", label: "Outfit pieces identified", atPercent: 100 },
] as const;

export function OutfitLoading({ userId }: { userId: string }) {
  const router = useRouter();
  const draft = useOutfitDiaryUploadStore((state) => state.draft);
  const setResult = useOutfitDiaryUploadStore((state) => state.setResult);
  const reset = useOutfitDiaryUploadStore((state) => state.reset);
  const [percent, setPercent] = useState(0);

  const { data: profile } = useQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

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
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav username={profile?.username} />

      {/* Mobile top bar */}
      <div className="flex items-center px-6 pt-8 lg:hidden">
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

      {/* Desktop Mascot Banner (D.2.1.1) */}
      <div className="relative hidden w-full overflow-hidden border-b border-border/20 lg:block h-64">
        <Image
          src={skyImage}
          alt=""
          fill
          priority
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
        <div className="relative mx-auto flex h-full max-w-5xl items-end justify-between px-12 pb-4">
          <div className="relative h-44 w-44 -mb-2">
            <Image
              src={sootSpriteImage}
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-48 w-48 -mb-4">
            <Image
              src={silverHangerImage}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Mobile placeholder banner */}
      <div className="bg-muted mt-6 flex h-64 items-center justify-center lg:hidden">
        <Sparkle className="text-foreground/30 size-40" />
      </div>

      <main className="mx-auto flex w-full max-w-sm lg:max-w-xl flex-1 flex-col items-center gap-6 px-6 py-10 lg:py-12 text-center">
        <Typography variant="title" as="h1" className="text-3xl lg:text-4xl font-serif">
          <em className="italic">Generating</em> your gorgeous look.
        </Typography>

        <Typography variant="subtitle" className="max-w-xs text-xs lg:text-sm uppercase tracking-wider text-muted-foreground">
          Hang on while we create this for your calendar.
        </Typography>

        <span className="text-xl lg:text-2xl font-bold">{percent}%</span>

        <div className="flex flex-col items-center gap-3">
          {STEPS.map((step) => {
            const done = percent >= step.atPercent;
            return (
              <div key={step.key} className="flex items-center gap-2">
                <Sparkle
                  className={cn(
                    "size-4",
                    done ? "text-foreground" : "text-muted-foreground/30",
                  )}
                />
                <span
                  className={cn(
                    "text-xs lg:text-sm font-medium tracking-wide uppercase",
                    done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 hidden lg:block">
          <Button
            type="button"
            className="bg-[#393735] text-white hover:bg-[#2b2a27] rounded-xl px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-md"
            onClick={() => router.push("/home")}
          >
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
