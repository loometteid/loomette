"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

// Placeholder destination for Calendar's "Mix & Match" action. No
// recommendation logic yet -- this just needs to exist as a real route.
export function MixAndMatch() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
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

      <div className="mt-24 flex flex-1 flex-col items-center gap-2 text-center">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Mix &amp; Match
        </Typography>
        <Typography variant="subtitle">Coming soon.</Typography>
      </div>
    </main>
  );
}
