"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import blackHangerImage from "@/domains/auth/assets/black-hanger.png";

export interface WaitlistShellProps {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  "data-testid"?: string;
}

export function WaitlistShell({
  title,
  subtitle,
  children,
  "data-testid": dataTestId = "waitlist-shell",
}: WaitlistShellProps) {
  return (
    <div
      data-testid={dataTestId}
      className="flex min-h-dvh w-full flex-col bg-background lg:flex-row overflow-x-hidden"
    >
      {/* Left Column: Desktop Visual Sky and Mascots Banner */}
      <section
        aria-label="Loomette Waitlist Visual"
        data-testid="waitlist-shell__visual-panel"
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
        aria-label="Waitlist Form"
        data-testid="waitlist-shell__form-panel"
        className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:px-12 xl:px-16 min-h-dvh lg:h-screen lg:overflow-y-auto"
      >
        <div className="flex flex-1 flex-col justify-between max-w-md w-full mx-auto">
          {/* Top Bar with Back Button linking to Home */}
          <div className="flex items-center justify-between pb-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              nativeButton={false}
              render={<Link href="/" />}
              className="rounded-xl size-10 shrink-0"
              aria-label="Back to home"
              data-testid="waitlist-shell__back-button"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col my-auto py-6">
            <div className="flex flex-col gap-2">
              <Sparkle className="size-6 text-foreground shrink-0" />
              <Typography
                variant="title"
                as="h1"
                data-testid="waitlist-shell__title"
                className="text-2xl sm:text-3xl font-serif text-foreground"
              >
                {title}
              </Typography>
              <Typography
                variant="subtitle"
                data-testid="waitlist-shell__subtitle"
                className="text-xs text-muted-foreground uppercase tracking-widest"
              >
                {subtitle}
              </Typography>
            </div>

            <div className="mt-8 flex flex-col gap-6">{children}</div>
          </div>

          {/* Bottom subtle brand footer for consistency */}
          <div className="pt-4 text-center">
            <span className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-widest">
              Loomette ㆍ Early Access
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
