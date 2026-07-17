"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function AddInitialItem() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
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
          Now, let&apos;s fill your wardrobe.
        </Typography>
        <Typography variant="subtitle" className="max-w-xs">
          Add 5-10 of your go-to pieces. The ones you actually reach for.
        </Typography>

        <label className="text-muted-foreground hover:border-foreground/40 mt-6 flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-4 text-xs font-medium tracking-wide uppercase transition-colors">
          <ImagePlus className="size-4" />
          {fileName ?? "Upload Photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? null)
            }
          />
        </label>
      </div>

      <Button type="button" disabled className="w-full">
        Just Generate The Basics
      </Button>
    </main>
  );
}
