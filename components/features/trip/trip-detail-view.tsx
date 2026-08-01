"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { OutfitComposition } from "@/components/features/outfit/outfit-composition";
import { formatDayDate } from "./trip-dates";
import type { Trip, TripDayOutfit } from "./types";

const TABS = ["outfit-plan", "packing-list"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  "outfit-plan": "Outfit Plan",
  "packing-list": "Packing List",
};

export function TripDetailView({
  trip,
  days,
  outfitsByDay,
}: {
  trip: Trip;
  days: string[];
  outfitsByDay: Record<string, TripDayOutfit[]>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("outfit-plan");

  function handlePlanOutfit(day: string) {
    router.push(
      `/mix-and-match?tripId=${trip.id}&day=${day}&returnTo=${encodeURIComponent(`/trip/${trip.id}`)}`,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
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
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={() => router.push(`/trip/${trip.id}/edit`)}
          aria-label="Edit trip"
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative h-28 w-28">
          <Image src="/profile/koper.png" alt="" fill className="object-contain" />
        </div>
        <Typography variant="title" as="h1">
          {trip.name ?? "Untitled trip"}
        </Typography>
        <Typography variant="subtitle">
          {days.length} {days.length === 1 ? "Day" : "Days"}
        </Typography>
      </div>

      <div className="border-border flex items-center justify-between border-b">
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === "outfit-plan" ? setTab(value) : toast("Coming soon."))}
            className={cn(
              "pb-3 text-sm font-medium tracking-wide uppercase transition-colors",
              tab === value
                ? "text-foreground border-foreground border-b-2"
                : "text-muted-foreground",
            )}
          >
            {TAB_LABEL[value]}
          </button>
        ))}
      </div>

      {tab === "outfit-plan" && (
        <div className="flex flex-col">
          {days.map((day, index) => {
            const outfits = outfitsByDay[day] ?? [];
            const isLast = index === days.length - 1;
            return (
              <div key={day} className="relative flex gap-4 pb-8">
                {!isLast && (
                  <span
                    aria-hidden
                    className="border-border absolute top-6 bottom-0 left-[9px] border-l border-dashed"
                  />
                )}
                <Sparkle className="text-foreground mt-1 size-5 shrink-0" />
                <div className="flex flex-1 flex-col gap-4">
                  <Typography variant="h1" as="h2">
                    Day {index + 1} - {formatDayDate(day)}
                  </Typography>

                  {outfits.map((outfit) => (
                    <OutfitComposition
                      key={outfit.wearLogId}
                      items={outfit.items}
                      className="aspect-5/6 w-full"
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => handlePlanOutfit(day)}
                    className="border-border text-foreground self-start rounded-full border px-5 py-2.5 text-xs font-medium tracking-wide uppercase"
                  >
                    Plan Outfit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
