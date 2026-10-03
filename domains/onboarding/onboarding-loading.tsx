import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import blackHangerImage from "@/domains/auth/assets/black-hanger.png";

export interface OnboardingFallbackProps {
  step?: number;
  totalSteps?: number;
}

export function OnboardingFallback({
  step = 1,
  totalSteps = 5,
}: OnboardingFallbackProps) {
  const progressPercent = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div
      data-testid="onboarding-loading"
      className="flex min-h-dvh w-full flex-col bg-background lg:flex-row overflow-x-hidden"
    >
      {/* Left Column: Desktop Visual Sky and Mascots Banner */}
      <section
        aria-label="Loomette Onboarding Visual Loading"
        className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-muted/20 select-none"
      >
        <div className="absolute inset-0">
          <Image
            src={skyImage}
            alt=""
            fill
            priority
            sizes="50vw"
            className="pointer-events-none object-cover grayscale contrast-125 select-none"
          />
        </div>

        {/* Silver hanger mascot: Top-right corner */}
        <div className="pointer-events-none absolute top-[16%] -right-8 w-72 xl:w-88 drop-shadow-md z-20 select-none">
          <Image
            src={silverHangerImage}
            alt=""
            width={1536}
            height={1024}
            priority
            className="w-full h-auto select-none"
          />
        </div>

        {/* Black hanger mascot: Bottom-left corner */}
        <div className="pointer-events-none absolute -bottom-6 -left-10 w-80 xl:w-96 drop-shadow-xl z-20 select-none">
          <Image
            src={blackHangerImage}
            alt=""
            width={1536}
            height={1024}
            priority
            className="w-full h-auto select-none"
          />
        </div>
      </section>

      {/* Right Column: Form Panel Skeleton */}
      <section
        aria-label="Onboarding Loading Panel"
        className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:px-12 xl:px-16 min-h-dvh lg:h-screen lg:overflow-y-auto"
      >
        <div className="flex flex-1 flex-col justify-between max-w-md w-full mx-auto">
          {/* Top Bar for Mobile: Back button (Step > 1) + Progress bar */}
          <div className="flex items-center gap-3 lg:hidden">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="rounded-xl size-10 shrink-0 opacity-60"
                disabled
                aria-label="Go back"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Desktop Standalone Progress Bar */}
          <div className="hidden lg:flex w-full justify-center pt-2 pb-6">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Content Skeleton Area */}
          <div className="flex flex-1 flex-col">
            <div className="mt-6 lg:mt-2 flex flex-col gap-2">
              <Sparkle className="size-6 text-foreground/40 shrink-0" />
              <div className="h-8 w-3/4 max-w-xs bg-muted animate-pulse rounded-lg" />
              <div className="h-3.5 w-1/2 max-w-xs bg-muted/60 animate-pulse rounded" />
            </div>

            {/* Field Skeletons */}
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-24 bg-muted/60 animate-pulse rounded" />
                <div className="h-11 w-full bg-secondary animate-pulse rounded-xl" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-28 bg-muted/60 animate-pulse rounded" />
                <div className="h-11 w-full bg-secondary animate-pulse rounded-xl" />
              </div>

              {step > 2 && (
                <div className="flex flex-col gap-2">
                  <div className="h-3.5 w-32 bg-muted/60 animate-pulse rounded" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="h-8 w-20 bg-secondary animate-pulse rounded-full" />
                    <div className="h-8 w-24 bg-secondary animate-pulse rounded-full" />
                    <div className="h-8 w-28 bg-secondary animate-pulse rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Submit Button Skeleton */}
          <div className="pt-8 lg:hidden">
            <div className="h-12 w-full bg-primary/20 animate-pulse rounded-2xl" />
          </div>

          {/* Desktop Bottom Action Bar Skeleton */}
          <div
            className={`hidden lg:flex items-center pt-10 pb-4 ${
              step > 1 ? "justify-between" : "justify-end"
            }`}
          >
            {step > 1 && (
              <div className="size-10 rounded-xl bg-secondary animate-pulse shrink-0" />
            )}
            <div className="h-10 w-28 rounded-xl bg-primary/20 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
