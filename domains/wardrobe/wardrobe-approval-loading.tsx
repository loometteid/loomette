import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function ApprovalFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-xl opacity-60"
        nativeButton={false}
        render={<Link href="/wardrobe" prefetch={true} aria-label="Go back" />}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Approval Queue
          </Typography>
        </div>
        <div className="bg-muted h-3.5 w-12 animate-pulse rounded" />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3"
          >
            <div className="bg-muted size-5 animate-pulse rounded" />
            <div className="bg-muted size-14 shrink-0 animate-pulse rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="bg-muted h-4 w-28 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <div className="bg-secondary h-11 flex-1 animate-pulse rounded-full" />
        <div className="bg-muted h-11 flex-1 animate-pulse rounded-full" />
      </div>
    </main>
  );
}
