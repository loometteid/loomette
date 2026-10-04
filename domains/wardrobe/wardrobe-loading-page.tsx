"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { cn } from "@/lib/utils";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { getUploadJobQueryOptionsForBrowser } from "./query-options/get-upload-job.query-option.client";
import { getLatestUploadJobQueryOptionsForBrowser } from "./query-options/get-latest-upload-job.query-option.client";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import sootSpriteImage from "@/domains/auth/assets/soot-sprite.png";

export function WardrobeLoadingView({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

  const { data: specificJob } = useQuery(
    getUploadJobQueryOptionsForBrowser(jobId),
  );
  const { data: latestJob } = useQuery(
    getLatestUploadJobQueryOptionsForBrowser(userId),
  );

  const job = specificJob ?? (jobId ? null : latestJob);
  const redirectedRef = useRef(false);

  // Auto-redirect to approval queue when completed
  useEffect(() => {
    if (job?.status === "completed" && !redirectedRef.current) {
      redirectedRef.current = true;
      const timer = setTimeout(() => {
        router.push("/wardrobe/approval");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [job?.status, router]);

  const isFailed = job?.status === "failed";
  const isAnalyzing = !isFailed && job?.status !== "completed";
  const isCompleted = job?.status === "completed";

  const steps = [
    {
      key: "received",
      label: "Photo received",
      done: true,
      active: false,
    },
    {
      key: "analyzing",
      label: "Analyzing your outfit…",
      done: isCompleted,
      active: isAnalyzing,
    },
    {
      key: "adding",
      label: "Adding to your wardrobe",
      done: isCompleted,
      active: false,
    },
  ];

  function handleNavigateAway() {
    router.push("/wardrobe/approval");
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      data-testid="wardrobe-loading-page"
    >
      <DesktopNav username={profile?.username} />

      {/* Mobile top bar */}
      <div className="flex items-center px-6 pt-8 lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          data-testid="wardrobe-loading-page__back-button"
          className="bg-secondary flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-secondary/80"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Desktop Header Banner with Mascots */}
      <div className="relative hidden w-full overflow-hidden border-b border-border/20 lg:block h-64">
        <Image
          src={skyImage}
          alt=""
          fill
          priority
          className="object-cover brightness-95"
        />
        <div className="absolute inset-0 flex items-end justify-between px-24 pb-0 pointer-events-none">
          <div className="relative h-44 w-44 translate-y-4">
            <Image
              src={sootSpriteImage}
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-56 w-56 translate-y-6">
            <Image
              src={silverHangerImage}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Mobile Cloud / Star visual */}
      <div className="relative mx-auto mt-4 flex h-60 w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl lg:hidden">
        <Image
          src={skyImage}
          alt=""
          fill
          priority
          className="object-cover brightness-95"
        />
        <div className="relative z-10 flex size-36 items-center justify-center">
          <Sparkle className="size-28 text-white/90 drop-shadow-md animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        {isFailed ? (
          <div
            className="flex flex-col items-center gap-4"
            data-testid="wardrobe-loading-page__failed-state"
          >
            <AlertCircle className="size-10 text-destructive" />
            <Typography variant="title" as="h1" className="text-2xl font-serif">
              Couldn&apos;t detect items
            </Typography>
            <p className="text-muted-foreground text-xs max-w-xs">
              {job?.error_message ||
                "We couldn't detect any clothing pieces in this photo. Please try another angle or clearer photo."}
            </p>
            <div className="mt-6 flex w-full flex-col gap-3">
              <Button
                type="button"
                className="w-full gap-2 rounded-xl"
                onClick={() => router.push("/wardrobe/add")}
                data-testid="wardrobe-loading-page__retry-button"
              >
                <RefreshCw className="size-4" />
                Try Another Photo
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full rounded-xl"
                onClick={() => router.push("/wardrobe")}
              >
                Back to Wardrobe
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Typography
                variant="title"
                as="h1"
                className="text-3xl font-serif"
                data-testid="wardrobe-loading-page__title"
              >
                We&apos;re <em className="italic underline">working</em> on your look.
              </Typography>
              <p className="text-muted-foreground max-w-xs text-[0.68rem] font-medium uppercase tracking-wider leading-relaxed">
                This can take a few minutes. No need to wait. We&apos;ll notify you once it&apos;s ready.
              </p>
            </div>

            {/* Checklist */}
            <div
              className="flex flex-col items-start gap-4 py-4"
              data-testid="wardrobe-loading-page__steps"
            >
              {steps.map((step) => (
                <div key={step.key} className="flex items-center gap-3">
                  <Sparkle
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      step.done
                        ? "text-foreground"
                        : step.active
                          ? "text-foreground animate-spin"
                          : "text-muted-foreground/30",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider transition-colors",
                      step.done || step.active
                        ? "text-foreground"
                        : "text-muted-foreground/40",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Action button */}
            <div className="mt-8 w-full">
              <button
                type="button"
                onClick={handleNavigateAway}
                data-testid="wardrobe-loading-page__got-it-button"
                className="bg-[#393735] hover:bg-[#2b2a27] text-white flex w-full items-center justify-center rounded-2xl py-4 text-xs font-semibold uppercase tracking-wider shadow-lg transition-transform active:scale-95"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
