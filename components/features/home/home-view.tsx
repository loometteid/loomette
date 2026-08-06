"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { styleTagLabel, type StyleTag } from "@/lib/styleTags";
import {
  DEFAULT_SLOT_POSITIONS,
  OutfitComposition,
  type CompositionItem,
} from "@/components/features/outfit/outfit-composition";
import type { FavoriteItem } from "./types";

export function HomeView({
  displayName,
  profilePhoto,
  styleTags,
  favoriteTop,
  favoriteBottom,
  topCategory,
  looksCount,
}: {
  displayName: string | null;
  profilePhoto: string | null;
  styleTags: StyleTag[];
  favoriteTop: FavoriteItem | null;
  favoriteBottom: FavoriteItem | null;
  topCategory: string | null;
  looksCount: number;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const initials = (displayName ?? "?").slice(0, 2).toUpperCase();
  const codedTag = styleTags[0];

  // No saved composition exists for the homepage hero -- lay the two
  // favorites out using the same default Tops/Bottoms slots Mix &
  // Match's Shuffle uses, so top and bottom land with a natural,
  // Figma-matching overlap instead of colliding in the middle.
  const heroItems: CompositionItem[] = [
    favoriteTop && {
      id: favoriteTop.id,
      image_url: favoriteTop.image_url,
      name: favoriteTop.name,
      layerOrder: 0,
      ...DEFAULT_SLOT_POSITIONS.Tops,
    },
    favoriteBottom && {
      id: favoriteBottom.id,
      image_url: favoriteBottom.image_url,
      name: favoriteBottom.name,
      layerOrder: 1,
      ...DEFAULT_SLOT_POSITIONS.Bottoms,
    },
  ].filter((item): item is CompositionItem => !!item);

  function handleGenerate() {
    toast("Outfit generation is coming soon.");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 py-8">
      <div className="flex items-center justify-between">
        <Avatar size="lg" className="size-14 rounded-2xl">
          <AvatarImage src={profilePhoto ?? undefined} alt="" />
          <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => router.push("/home/notifications")}
          aria-label="Notifications"
          className="bg-secondary flex size-10 items-center justify-center rounded-xl"
        >
          <Bell className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Sparkle className="text-foreground mt-2 size-5 shrink-0" />
          <Typography variant="title" as="h1">
            Ready to <span className="underline">style</span> in,
            <br />
            <em className="italic">{displayName ?? "there"}?</em>
          </Typography>
        </div>
        <Typography variant="subtitle">
          New pieces, new possibilities.
        </Typography>
      </div>

      <div className="relative flex items-center justify-center">
        <button
          type="button"
          disabled
          aria-label="Previous look"
          className="text-muted-foreground/40 absolute left-0 flex size-8 shrink-0 items-center justify-center"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="relative h-[420px] w-[180px]">
          {heroItems.length > 0 ? (
            <OutfitComposition
              items={heroItems}
              itemSizeRatio={0.8}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <Typography variant="subtitle">
                Add wardrobe items to see your look here.
              </Typography>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled
          aria-label="Next look"
          className="text-muted-foreground/40 absolute right-0 flex size-8 shrink-0 items-center justify-center"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="border-border flex flex-col gap-4 rounded-3xl border p-6">
        <Typography variant="h1" as="h2">
          I want to <em className="italic underline">wear</em>...
        </Typography>

        {styleTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {styleTags.map((tag) => (
              <span
                key={tag}
                className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium tracking-wide uppercase"
              >
                <TrendingUp className="size-3.5" />
                {styleTagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Blue shirt with pink accessory..."
            className="bg-secondary text-foreground placeholder:text-muted-foreground w-full rounded-full px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleGenerate}
            aria-label="Generate outfit"
            className="bg-foreground text-background flex size-11 shrink-0 items-center justify-center rounded-xl"
          >
            <Sparkles className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Typography variant="title" as="h2">
          Your preferences
        </Typography>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-foreground text-background row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl p-5">
            <Typography variant="h1" as="p" className="text-background">
              You are so{" "}
              <em className="italic underline">
                {codedTag ? styleTagLabel(codedTag).toLowerCase() : "figuring it out"}
              </em>{" "}
              coded
            </Typography>
            <Sparkle className="text-background/90 size-24 self-end" />
          </div>

          <PreferenceCard
            label="Your favorite"
            value="#1 Top"
            image={favoriteTop}
            tone="light"
          />
          <PreferenceCard
            label="Your favorite"
            value="#1 Bottom"
            image={favoriteBottom}
            tone="dark"
          />

          <div className="border-border flex flex-col justify-between gap-6 rounded-3xl border p-5">
            <div className="flex gap-1">
              <Sparkle className="text-foreground size-4" />
              <Sparkle className="text-foreground size-4" />
            </div>
            <div>
              <span className="text-muted-foreground block text-[0.65rem] font-medium tracking-wide uppercase">
                Number of wardrobe
              </span>
              <Typography variant="h1" as="p">
                {topCategory ? `#1 ${topCategory}` : "—"}
              </Typography>
            </div>
          </div>

          <div className="bg-foreground text-background relative flex flex-col justify-between overflow-hidden rounded-3xl p-5">
            <div>
              <span className="text-background/70 block text-[0.65rem] font-medium tracking-wide uppercase">
                Number of looks
              </span>
              <Typography variant="h1" as="p" className="text-background">
                {looksCount}
              </Typography>
            </div>
            <Sparkle className="text-background/90 absolute -right-2 -bottom-2 size-16" />
          </div>
        </div>
      </div>
    </main>
  );
}

function PreferenceCard({
  label,
  value,
  image,
  tone,
}: {
  label: string;
  value: string;
  image: FavoriteItem | null;
  tone: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl p-5",
        tone === "dark"
          ? "bg-foreground text-background"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      <div>
        <span
          className={cn(
            "block text-[0.65rem] font-medium tracking-wide uppercase",
            tone === "dark" ? "text-background/70" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        <Typography
          variant="h1"
          as="p"
          className={tone === "dark" ? "text-background" : undefined}
        >
          {value}
        </Typography>
      </div>
      {image?.image_url && (
        <div className="relative ml-auto aspect-square w-20">
          <Image
            src={image.image_url}
            alt={image.name ?? ""}
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
