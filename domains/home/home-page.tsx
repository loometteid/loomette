"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { styleTagLabel, type StyleTag } from "@/lib/styleTags";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.client";
import { useOnboardingGuard } from "@/domains/onboarding/hooks/use-onboarding-guard";
import { getLooksCountQueryOptionsForBrowser } from "./query-options/get-looks-count.query-option.client";
import { getUnreadNotificationsCountQueryOptionsForBrowser } from "./query-options/get-unread-notifications-count.query-option.client";
import { NotificationPopover } from "./components/notification-popover";
import { RecommendationDetailDialog } from "./components/recommendation-detail-dialog";
import { generateRandomRecommendations } from "./recommendation";
import type { FavoriteItem } from "./types";

export function HomeView({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState("");
  const [seedOffset, setSeedOffset] = useState(0);
  const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false);

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  useOnboardingGuard(profile);

  const { data: wardrobeItems } = useSuspenseQuery(
    getWardrobeItemsQueryOptionsForBrowser(userId),
  );
  const { data: looksCount } = useSuspenseQuery(
    getLooksCountQueryOptionsForBrowser(userId),
  );
  const { data: unreadNotificationsCount } = useSuspenseQuery(
    getUnreadNotificationsCountQueryOptionsForBrowser(userId),
  );

  const displayName = profile?.display_name ?? null;
  const profilePhoto = profile?.profile_photo ?? null;
  const styleTags = (profile?.style_tags ?? []) as StyleTag[];

  // Dynamic recommendation randomly composed from wardrobe or styled items
  const recommendation = useMemo(() => {
    return generateRandomRecommendations(wardrobeItems, seedOffset);
  }, [wardrobeItems, seedOffset]);

  const sortedRows = useMemo(() => {
    return [...wardrobeItems].sort((a, b) => {
      const wearDiff = (b.wear_count ?? 0) - (a.wear_count ?? 0);
      if (wearDiff !== 0) return wearDiff;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [wardrobeItems]);

  const favoriteTop = useMemo<FavoriteItem | null>(() => {
    const row = sortedRows.find((r) => r.item?.category === "Tops");
    if (!row?.item) {
      return {
        id: "top-fallback",
        name: "#1 Top",
        category: "Tops",
        image_url: "/brand/recommendation/favorite-top.png",
      };
    }
    return {
      id: row.item.item_id,
      name: row.item.name,
      category: row.item.category,
      image_url: row.item.image_url ?? "/brand/recommendation/favorite-top.png",
    };
  }, [sortedRows]);

  const favoriteBottom = useMemo<FavoriteItem | null>(() => {
    const row = sortedRows.find((r) => r.item?.category === "Bottoms");
    if (!row?.item) {
      return {
        id: "bottom-fallback",
        name: "#1 Bottom",
        category: "Bottoms",
        image_url: "/brand/recommendation/favorite-bottom.png",
      };
    }
    return {
      id: row.item.item_id,
      name: row.item.name,
      category: row.item.category,
      image_url: row.item.image_url ?? "/brand/recommendation/favorite-bottom.png",
    };
  }, [sortedRows]);

  const topCategory = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    for (const row of sortedRows) {
      const category = row.item?.category;
      if (!category) continue;
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
    let topCat: string | null = null;
    let topCount = 0;
    for (const [category, count] of categoryCounts) {
      if (count > topCount) {
        topCat = category;
        topCount = count;
      }
    }
    return topCat ?? "Top";
  }, [sortedRows]);

  const initials = (displayName ?? "?").slice(0, 2).toUpperCase();
  const codedTag = styleTags[0];

  function handleGenerate() {
    setSeedOffset((prev) => prev + 1);
    toast.success("Generated a fresh look!");
  }

  function handleSelectTag(tagText: string) {
    setPrompt((prev) => (prev ? `${prev}, ${tagText}` : tagText));
  }

  return (
    <main className="w-full">
      {/* ========================================================= */}
      {/* DESKTOP LAYOUT (Figma D.1 Homepage)                       */}
      {/* ========================================================= */}
      <div className="hidden lg:grid max-w-7xl mx-auto px-12 py-8 grid-cols-2 gap-12 items-start">
        {/* Left Column: Title, Subtitle, Outfit Hero with Chevrons */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <Sparkle className="text-foreground mt-2 size-7 shrink-0" />
              <Typography variant="title" as="h1" className="text-4xl font-serif">
                Ready to <span className="underline">style</span> in,{" "}
                <em className="italic">{displayName ?? "there"}?</em>
              </Typography>
            </div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase pl-10">
              Spring is coming, wear something sweet!
            </p>
          </div>

          <div className="relative flex items-center justify-center py-6">
            <button
              type="button"
              onClick={() => setSeedOffset((prev) => prev - 1)}
              aria-label="Previous look"
              className="text-muted-foreground hover:text-foreground absolute left-0 z-10 flex size-10 items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Clickable Outfit Hero for Desktop -> opens detail modal */}
            <button
              type="button"
              onClick={() => setRecommendationDialogOpen(true)}
              aria-label="View outfit recommendation detail"
              className="group relative h-[480px] w-80 max-w-full flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden rounded-2xl"
            >
              <OutfitComposition
                items={recommendation.compositionItems}
                className="h-full w-full"
              />
            </button>

            <button
              type="button"
              onClick={() => setSeedOffset((prev) => prev + 1)}
              aria-label="Next look"
              className="text-muted-foreground hover:text-foreground absolute right-0 z-10 flex size-10 items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>

        {/* Right Column: Bell Popover, Your Preferences, I want to wear... */}
        <div className="flex flex-col gap-8">
          {/* Bell Icon in Top Right */}
          <div className="flex justify-end">
            <NotificationPopover userId={userId} />
          </div>

          {/* Preferences Section */}
          <div className="flex flex-col gap-4">
            <Typography variant="title" as="h2" className="text-2xl font-serif">
              Your preferences
            </Typography>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Card 1: You are so ... coded */}
              <div className="bg-[#3B3A36] text-white row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl p-6 min-h-[200px] relative">
                <Typography variant="h1" as="p" className="text-white text-2xl font-serif leading-tight">
                  You are so{" "}
                  <em className="italic underline">
                    {codedTag
                      ? styleTagLabel(codedTag).toLowerCase()
                      : "casual-chic"}
                  </em>{" "}
                  coded
                </Typography>
                <div className="self-end mt-6 size-24 relative">
                  <Image
                    src="/brand/asterisk-silver.png"
                    alt=""
                    fill
                    className="object-contain opacity-90"
                  />
                </div>
              </div>

              {/* Card 2: #1 Top */}
              <PreferenceCard
                label="YOUR FAVORITE"
                value="#1 Top"
                image={favoriteTop}
                tone="light"
              />

              {/* Card 3: #1 Bottom */}
              <PreferenceCard
                label="YOUR FAVORITE"
                value="#1 Bottom"
                image={favoriteBottom}
                tone="dark"
              />

              {/* Card 4: NUMBER OF WARDROBE */}
              <div className="border border-border/80 flex flex-col justify-between gap-4 rounded-3xl p-5 bg-background">
                <div className="flex gap-1.5">
                  <Sparkle className="text-foreground size-4" />
                  <Sparkle className="text-foreground size-4" />
                  <Sparkle className="text-foreground size-4" />
                </div>
                <div>
                  <span className="text-muted-foreground block text-[0.6rem] font-semibold tracking-wider uppercase">
                    NUMBER OF WARDROBE
                  </span>
                  <Typography variant="h1" as="p" className="text-xl font-serif">
                    #{topCategory ? `1 ${topCategory}` : "1 Top"}
                  </Typography>
                </div>
              </div>

              {/* Card 5: NUMBER OF LOOKS */}
              <div className="bg-[#3B3A36] text-white relative flex flex-col justify-between overflow-hidden rounded-3xl p-5">
                <div>
                  <span className="text-white/70 block text-[0.6rem] font-semibold tracking-wider uppercase">
                    NUMBER OF LOOKS
                  </span>
                  <Typography variant="h1" as="p" className="text-white text-xl font-serif">
                    {looksCount || 123}
                  </Typography>
                </div>
                <div className="absolute -right-3 -bottom-3 size-20">
                  <Image
                    src="/brand/asterisk-silver.png"
                    alt=""
                    fill
                    className="object-contain opacity-70"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* I want to wear... Section */}
          <div className="border border-border/80 flex flex-col gap-4 rounded-3xl p-6 bg-background">
            <Typography variant="h1" as="h2" className="text-xl font-serif">
              I want to <em className="italic underline">wear</em>...
            </Typography>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectTag("Clean & Minimal")}
                className="border border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors"
              >
                <TrendingUp className="size-3.5" />
                CLEAN & MINIMAL
              </button>
              <button
                type="button"
                onClick={() => handleSelectTag("Disney")}
                className="border border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors"
              >
                <TrendingUp className="size-3.5" />
                DISNEY
              </button>
              {styleTags.slice(0, 2).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectTag(styleTagLabel(tag))}
                  className="border border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors"
                >
                  <TrendingUp className="size-3.5" />
                  {styleTagLabel(tag)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
                placeholder="Blue shirt with pink accessory..."
                className="bg-[#F2EDE5]/60 text-foreground placeholder:text-muted-foreground/70 w-full rounded-2xl px-5 py-3.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleGenerate}
                aria-label="Generate outfit"
                className="bg-[#3B3A36] hover:bg-black text-white flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors"
              >
                <Sparkles className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE LAYOUT (Figma 1. Homepage)                          */}
      {/* ========================================================= */}
      <div className="flex lg:hidden mx-auto w-full max-w-sm flex-col gap-6 px-6 py-6 pb-24">
        {/* Mobile Header: Avatar + Bell with Link */}
        <div className="flex items-center justify-between">
          <Avatar size="lg" className="size-14 rounded-2xl">
            <AvatarImage src={profilePhoto ?? undefined} alt="" />
            <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
          </Avatar>
          <Link
            href="/home/notifications"
            prefetch
            aria-label="Notifications"
            className="relative bg-secondary/80 flex size-11 items-center justify-center rounded-2xl"
          >
            <Bell className="size-4.5 text-foreground" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-400 ring-2 ring-background" />
            )}
          </Link>
        </div>

        {/* Mobile Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2.5">
            <Sparkle className="text-foreground mt-1.5 size-6 shrink-0" />
            <Typography variant="title" as="h1" className="text-3xl font-serif leading-tight">
              Ready to <span className="underline">style</span> in,
              <br />
              <em className="italic">{displayName ?? "there"}?</em>
            </Typography>
          </div>
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase pl-8.5">
            SPRING IS COMING, WEAR SOMETHING SWEET!
          </span>
        </div>

        {/* Mobile Outfit Hero: Wrapped in Link navigating to /home/recommendation */}
        <Link
          href="/home/recommendation"
          prefetch
          aria-label="Outfit recommendation detail"
          className="relative mx-auto h-[400px] w-72 max-w-full flex items-center justify-center overflow-hidden rounded-2xl"
        >
          <OutfitComposition
            items={recommendation.compositionItems}
            className="h-full w-full"
          />
        </Link>

        {/* Mobile "I want to wear..." card placed directly below Outfit Hero */}
        <div className="border border-border/80 flex flex-col gap-4 rounded-3xl p-5 bg-background">
          <Typography variant="h1" as="h2" className="text-lg font-serif">
            I want to <em className="italic underline">wear</em>...
          </Typography>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelectTag("Clean & Minimal")}
              className="border border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase"
            >
              <TrendingUp className="size-3" />
              CLEAN & MINIMAL
            </button>
            <button
              type="button"
              onClick={() => handleSelectTag("Disney")}
              className="border border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase"
            >
              <TrendingUp className="size-3" />
              DISNEY
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
              placeholder="Blue shirt with pink accessory..."
              className="bg-[#F2EDE5]/60 text-foreground placeholder:text-muted-foreground/70 w-full rounded-2xl px-4 py-3 text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleGenerate}
              aria-label="Generate outfit"
              className="bg-[#3B3A36] text-white flex size-11 shrink-0 items-center justify-center rounded-2xl"
            >
              <Sparkles className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile "Your preferences" Section placed below "I want to wear..." */}
        <div className="flex flex-col gap-4 pt-2">
          <Typography variant="title" as="h2" className="text-xl font-serif">
            Your preferences
          </Typography>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#3B3A36] text-white row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl p-5 min-h-[190px] relative">
              <Typography variant="h1" as="p" className="text-white text-xl font-serif">
                You are so{" "}
                <em className="italic underline">
                  {codedTag
                    ? styleTagLabel(codedTag).toLowerCase()
                    : "casual-chic"}
                </em>{" "}
                coded
              </Typography>
              <div className="self-end mt-4 size-20 relative">
                <Image
                  src="/brand/asterisk-silver.png"
                  alt=""
                  fill
                  className="object-contain opacity-90"
                />
              </div>
            </div>

            <PreferenceCard
              label="YOUR FAVORITE"
              value="#1 Top"
              image={favoriteTop}
              tone="light"
            />
            <PreferenceCard
              label="YOUR FAVORITE"
              value="#1 Bottom"
              image={favoriteBottom}
              tone="dark"
            />

            <div className="border border-border/80 flex flex-col justify-between gap-4 rounded-3xl p-4 bg-background">
              <div className="flex gap-1">
                <Sparkle className="text-foreground size-3.5" />
                <Sparkle className="text-foreground size-3.5" />
                <Sparkle className="text-foreground size-3.5" />
              </div>
              <div>
                <span className="text-muted-foreground block text-[0.55rem] font-semibold tracking-wider uppercase">
                  NUMBER OF WARDROBE
                </span>
                <Typography variant="h1" as="p" className="text-lg font-serif">
                  #{topCategory ? `1 ${topCategory}` : "1 Top"}
                </Typography>
              </div>
            </div>

            <div className="bg-[#3B3A36] text-white relative flex flex-col justify-between overflow-hidden rounded-3xl p-4">
              <div>
                <span className="text-white/70 block text-[0.55rem] font-semibold tracking-wider uppercase">
                  NUMBER OF LOOKS
                </span>
                <Typography variant="h1" as="p" className="text-white text-lg font-serif">
                  {looksCount || 123}
                </Typography>
              </div>
              <div className="absolute -right-2 -bottom-2 size-16">
                <Image
                  src="/brand/asterisk-silver.png"
                  alt=""
                  fill
                  className="object-contain opacity-70"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Modal Dialog */}
      <RecommendationDetailDialog
        open={recommendationDialogOpen}
        onOpenChange={setRecommendationDialogOpen}
        recommendation={recommendation}
        userId={userId}
      />
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
        "relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl p-5 min-h-[100px]",
        tone === "dark"
          ? "bg-[#3B3A36] text-white"
          : "bg-[#F2EDE5] text-[#3B3A36]",
      )}
    >
      <div>
        <span
          className={cn(
            "block text-[0.55rem] font-semibold tracking-wider uppercase",
            tone === "dark" ? "text-white/70" : "text-[#736E65]",
          )}
        >
          {label}
        </span>
        <Typography
          variant="h1"
          as="p"
          className={cn("text-lg font-serif", tone === "dark" ? "text-white" : "text-[#3B3A36]")}
        >
          {value}
        </Typography>
      </div>
      {image?.image_url && (
        <div className="relative ml-auto size-16 aspect-square">
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
