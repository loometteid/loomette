"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onSubmit,
  continueLabel = "Continue",
  continueDisabled = false,
}: {
  step: number;
  totalSteps: number;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent) => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}) {
  const router = useRouter();

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-1 flex-col px-6 py-8">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          {title}
        </Typography>
        <Typography variant="subtitle">{subtitle}</Typography>
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-6">{children}</div>

      <Button type="submit" disabled={continueDisabled} className="w-full">
        {continueLabel}
      </Button>
    </form>
  );
}
