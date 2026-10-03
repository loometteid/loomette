"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import blackHangerImage from "@/domains/auth/assets/black-hanger.png";

import type { Route } from "next";

export interface OnboardingShellProps {
  step: number;
  totalSteps?: number;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent) => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  backHref?: string;
  showBackButton?: boolean;
  "data-testid"?: string;
}

export function OnboardingShell({
  step,
  totalSteps = 5,
  title,
  subtitle,
  children,
  onSubmit,
  continueLabel = "Continue",
  continueDisabled = false,
  backHref,
  showBackButton = step > 1,
  "data-testid": dataTestId = "onboarding-shell",
}: OnboardingShellProps) {
  const router = useRouter();

  const backTarget: Route =
    (backHref as Route) ?? (`/onboarding/${step - 1}` as Route);

  const handleBack = () => {
    router.push(backTarget);
  };

  const progressPercent = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div
      data-testid={dataTestId}
      className="flex min-h-dvh w-full flex-col bg-background lg:flex-row overflow-x-hidden"
    >
      {/* Left Column: Desktop Visual Sky and Mascots Banner */}
      <section
        aria-label="Loomette Onboarding Visual"
        data-testid="onboarding-shell__visual-panel"
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

      {/* Right Column: Form Panel */}
      <section
        aria-label="Onboarding Form"
        data-testid="onboarding-shell__form-panel"
        className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:px-12 xl:px-16 min-h-dvh lg:h-screen lg:overflow-y-auto"
      >
        <form
          onSubmit={onSubmit}
          data-testid="onboarding-shell__form"
          className="flex flex-1 flex-col justify-between max-w-md w-full mx-auto"
        >
          {/* Top Bar for Mobile: Back button + Progress bar */}
          <div className="flex items-center gap-3 lg:hidden">
            {showBackButton && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="rounded-xl size-10 shrink-0"
                onClick={handleBack}
                aria-label="Go back"
                data-testid="onboarding-shell__back-button"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <div
              data-testid="onboarding-shell__progress-bar"
              className="h-1 flex-1 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Desktop Standalone Progress Bar (Centered at Top) */}
          <div className="hidden lg:flex w-full justify-center pt-2 pb-6">
            <div
              data-testid="onboarding-shell__progress-bar--desktop"
              className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col">
            <div className="mt-6 lg:mt-2 flex flex-col gap-2">
              <Sparkle className="size-6 text-foreground shrink-0" />
              <Typography
                variant="title"
                as="h1"
                data-testid="onboarding-shell__title"
                className="text-2xl sm:text-3xl font-serif text-foreground"
              >
                {title}
              </Typography>
              <Typography
                variant="subtitle"
                data-testid="onboarding-shell__subtitle"
                className="text-xs text-muted-foreground uppercase tracking-widest"
              >
                {subtitle}
              </Typography>
            </div>

            <div className="mt-8 flex flex-col gap-6">{children}</div>
          </div>

          {/* Mobile Bottom Submit Button */}
          <div className="pt-8 lg:hidden">
            <Button
              type="submit"
              disabled={continueDisabled}
              data-testid="onboarding-shell__submit-button"
              className="w-full h-12 rounded-2xl text-sm uppercase tracking-wider font-medium"
            >
              {continueLabel}
            </Button>
          </div>

          {/* Desktop Bottom Action Bar */}
          <div
            className={`hidden lg:flex items-center pt-10 pb-4 ${
              showBackButton ? "justify-between" : "justify-end"
            }`}
          >
            {showBackButton && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="rounded-xl size-10 shrink-0"
                onClick={handleBack}
                aria-label="Go back"
                data-testid="onboarding-shell__back-button--desktop"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <Button
              type="submit"
              disabled={continueDisabled}
              data-testid="onboarding-shell__submit-button--desktop"
              className="px-8 h-10 rounded-xl text-xs uppercase tracking-widest font-semibold"
            >
              {continueLabel}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
