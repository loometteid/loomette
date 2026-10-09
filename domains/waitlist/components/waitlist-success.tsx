"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export interface WaitlistSuccessProps {
  email: string;
  name?: string;
  "data-testid"?: string;
}

export function WaitlistSuccess({
  email,
  name,
  "data-testid": dataTestId = "waitlist-success",
}: WaitlistSuccessProps) {
  return (
    <div
      data-testid={dataTestId}
      className="flex flex-col items-center text-center gap-6 py-6"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Sparkle className="size-7" />
      </div>

      <div className="flex flex-col gap-2">
        <Typography
          variant="title"
          as="h2"
          data-testid="waitlist-success__title"
          className="text-2xl sm:text-3xl font-serif text-foreground"
        >
          {name ? `You're on the list, ${name}!` : "You're on the list!"}
        </Typography>
        <p
          data-testid="waitlist-success__description"
          className="text-sm text-muted-foreground max-w-sm leading-relaxed"
        >
          We&apos;re opening early access in waves. We&apos;ll send an invite to{" "}
          <span className="font-semibold text-foreground">{email}</span> as soon
          as your spot is ready.
        </p>
      </div>

      <div className="pt-4 w-full">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          data-testid="waitlist-success__home-button"
          className="w-full h-12 rounded-2xl text-sm uppercase tracking-wider font-semibold shadow-sm"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
