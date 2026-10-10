"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { cn } from "@/lib/utils";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { processOutfitPhotoMutationOptions } from "./mutation-options/process-outfit-photo.mutation-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-pending-count.query-option.client";
import { getPendingWardrobeItemsQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-pending-items.query-option.client";
import { getLatestUploadJobQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-latest-upload-job.query-option.client";
import { getUploadJobQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-upload-job.query-option.client";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import sootSpriteImage from "@/domains/auth/assets/soot-sprite.png";

const STEPS = [
  { key: "uploaded", label: "PHOTO UPLOADED", atPercent: 35 },
  { key: "identified", label: "OUTFIT PIECES IDENTIFIED", atPercent: 100 },
] as const;

export function OutfitLoading({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useOutfitDiaryUploadStore((state) => state.draft);
  const setResult = useOutfitDiaryUploadStore((state) => state.setResult);
  const reset = useOutfitDiaryUploadStore((state) => state.reset);
  const [percent, setPercent] = useState(10);

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

  const isMountedRef = useRef(true);
  const crawlTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { mutate: processPhoto } = useMutation({
    ...processOutfitPhotoMutationOptions(),
    async onSuccess(result) {
      if (!isMountedRef.current) return;
      clearInterval(crawlTimerRef.current);
      setPercent(100);
      setResult(result);

      // Invalidate queries after extract-garments finishes staging items
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getLatestUploadJobQueryOptionsForBrowser(userId).queryKey,
      });
      if (result.uploadJobId) {
        void queryClient.invalidateQueries({
          queryKey: getUploadJobQueryOptionsForBrowser(result.uploadJobId).queryKey,
        });
      }
      void queryClient.invalidateQueries({
        queryKey: ["wardrobe"],
      });

      await new Promise((resolve) => setTimeout(resolve, 600));
      if (!isMountedRef.current) return;
      router.push("/calendar/outfit-approval");
    },
    onError(err) {
      if (!isMountedRef.current) return;
      clearInterval(crawlTimerRef.current);
      toast.error(
        err instanceof Error ? err.message : "Couldn't process that photo.",
      );
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
    setPercent(15);

    processPhoto({
      userId: draft.userId,
      file: draft.file,
      onStepChange: (step) => {
        if (!isMountedRef.current) return;
        if (step === "extracting") {
          // Photo uploaded to storage - check off step 1
          setPercent(50);
          clearInterval(crawlTimerRef.current);
          crawlTimerRef.current = setInterval(() => {
            setPercent((prev) => (prev < 92 ? prev + 3 : prev));
          }, 1200);
        } else if (step === "completed") {
          clearInterval(crawlTimerRef.current);
          setPercent(100);
        }
      },
    });
  });

  useEffect(() => {
    process();

    return () => {
      isMountedRef.current = false;
      clearInterval(crawlTimerRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav userId={userId} />

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

      {/* Mobile Sky Banner with Mascot (2.1.1) */}
      <div className="relative w-full h-72 overflow-hidden lg:hidden">
        <Image
          src={skyImage}
          alt=""
          fill
          priority
          className="object-cover brightness-95"
        />
        <div className="absolute top-8 left-6 z-20">
          <button
            type="button"
            onClick={() => {
              isMountedRef.current = false;
              clearInterval(crawlTimerRef.current);
              reset();
              router.push("/calendar");
            }}
            aria-label="Cancel"
            className="bg-white/80 backdrop-blur-sm text-foreground flex size-9 items-center justify-center rounded-xl shadow-sm transition-colors hover:bg-white"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div className="relative h-44 w-44">
            <Image
              src={silverHangerImage}
              alt=""
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-sm lg:max-w-xl flex-1 flex-col items-center gap-6 px-6 py-10 lg:py-12 text-center">
        <Typography
          variant="title"
          as="h1"
          className="text-3xl lg:text-4xl font-serif"
        >
          <em className="italic">Generating</em> your gorgeous look.
        </Typography>

        <Typography
          variant="subtitle"
          className="max-w-xs text-xs lg:text-sm uppercase tracking-wider text-muted-foreground"
        >
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
