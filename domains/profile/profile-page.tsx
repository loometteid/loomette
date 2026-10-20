"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Heart, Pencil, Plus, Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { formatTripMonthYear } from "@/domains/trip/trip-dates";
import { useOnboardingGuard } from "@/domains/onboarding/hooks/use-onboarding-guard";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { getFavoriteOutfitsQueryOptionsForBrowser } from "./query-options/get-favorite-outfits.query-option.client";
import { getWishlistQueryOptionsForBrowser } from "./query-options/get-wishlist.query-option.client";
import { getTripsQueryOptionsForBrowser } from "./query-options/get-trips.query-option.client";
import { AddToWardrobeDialog } from "./components/add-to-wardrobe-dialog";
import type { WishlistEntry } from "./types";

const TABS = ["favorite", "travels", "wishlist"] as const;
type Tab = (typeof TABS)[number];

const FAVORITE_FILTERS = ["all", "wardrobe", "outfit"] as const;
type FavoriteFilter = (typeof FAVORITE_FILTERS)[number];

const WISHLIST_FILTERS = ["all", "from video", "shop"] as const;
type WishlistFilter = (typeof WISHLIST_FILTERS)[number];

export function ProfileView({ userId }: { userId: string }) {
  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  useOnboardingGuard(profile);

  const [tab, setTab] = useState<Tab>("favorite");
  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("all");
  const [wishlistFilter, setWishlistFilter] = useState<WishlistFilter>("all");
  const [selectedWishlistItem, setSelectedWishlistItem] =
    useState<WishlistEntry | null>(null);

  const { data: favorites } = useSuspenseQuery(
    getFavoriteOutfitsQueryOptionsForBrowser(userId),
  );
  const { data: wishlist } = useSuspenseQuery(
    getWishlistQueryOptionsForBrowser(userId),
  );
  const { data: trips } = useSuspenseQuery(
    getTripsQueryOptionsForBrowser(userId),
  );

  const username = profile?.username ?? "you";
  const displayName = profile?.display_name ?? null;
  const profilePhoto = profile?.profile_photo ?? null;
  const outfitSize = profile?.outfit_size ?? null;
  const shoeSize = profile?.shoe_size ?? null;

  const initials = (displayName ?? username).slice(0, 2).toUpperCase();
  const sizeLine = [outfitSize?.toUpperCase(), shoeSize]
    .filter(Boolean)
    .join(" · ");

  // Wardrobe-item-level favoriting doesn't exist yet (no such column)
  const visibleFavorites = favoriteFilter === "wardrobe" ? [] : favorites;

  function handleAddToWardrobe(item: { id: string; name: string | null }) {
    setSelectedWishlistItem(null);
    toast.success(`"${item.name ?? "Item"}" added to your wardrobe`);
  }

  return (
    <main
      data-testid="profile-page"
      data-entity-id={userId}
      className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col lg:flex-row gap-0 lg:gap-14 px-0 lg:px-12 py-0 lg:py-12"
    >
      {/* =========================================================================
          MOBILE HEADER (< lg)
      ========================================================================== */}
      <div className="relative h-60 w-full lg:hidden">
        <Image
          src="/brand/sky.png"
          alt=""
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="relative">
              <Avatar
                size="lg"
                className="border-background size-18 rounded-2xl border-2"
              >
                <AvatarImage src={profilePhoto ?? undefined} alt="" />
                <AvatarFallback className="rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Link
                href="/profile/edit"
                prefetch
                aria-label="Edit profile"
                className="bg-background absolute -bottom-2 -left-2 flex size-7 items-center justify-center rounded-full shadow"
              >
                <Pencil className="size-3.5" />
              </Link>
            </div>

            <Link
              href={"/profile/social" as Route}
              prefetch
              aria-label="Social Profile"
              className="bg-secondary/90 flex size-10 items-center justify-center rounded-xl"
            >
              <Users className="size-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-sm font-normal tracking-wide text-white/90 uppercase">
              @{username}
            </span>
            <Typography variant="title" as="p" className="font-serif text-[28px] font-normal tracking-tight text-white leading-tight">
              {displayName ?? username}
            </Typography>
            {sizeLine && (
              <span className="font-sans text-sm font-normal tracking-wide text-white/90 uppercase">{sizeLine}</span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP SIDEBAR (lg:)
      ========================================================================== */}
      <aside className="hidden lg:flex flex-col items-center text-center gap-8 w-64 shrink-0">
        <div className="relative">
          <Avatar className="size-36 rounded-3xl bg-[#A2C4B7] shadow-sm">
            <AvatarImage
              src={profilePhoto ?? undefined}
              alt=""
              className="object-cover"
            />
            <AvatarFallback className="rounded-3xl bg-[#A2C4B7] text-white text-3xl font-serif">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Link
            href="/profile/edit"
            prefetch
            aria-label="Edit profile"
            className="bg-background hover:bg-secondary absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-xl shadow transition-colors"
          >
            <Pencil className="size-4 text-foreground" />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span
            data-testid="profile-page__username"
            className="font-sans text-sm lg:text-base font-normal tracking-wider text-muted-foreground uppercase"
          >
            @{username}
          </span>
          <Typography
            variant="title"
            as="h1"
            data-testid="profile-page__display-name"
            className="font-serif text-[32px] font-normal tracking-tight text-foreground leading-tight"
          >
            {displayName ?? username}
          </Typography>
          {sizeLine && (
            <span className="font-sans text-sm font-normal tracking-wide text-muted-foreground uppercase">
              {sizeLine}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3 pt-4">
          <Link
            href={"/profile/social" as Route}
            prefetch
            data-testid="profile-page__social-link"
            className="w-full flex items-center justify-center gap-2.5 bg-[#383733] hover:bg-[#2A2926] text-white py-3.5 rounded-2xl font-sans text-xs lg:text-sm font-normal tracking-wider uppercase transition-colors shadow-sm"
          >
            <Users className="size-4" />
            <span>Social Circle</span>
          </Link>
          <Link
            href="/profile/settings"
            prefetch
            data-testid="profile-page__settings-link"
            className="w-full flex items-center justify-center gap-2.5 bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#383733] py-3.5 rounded-2xl font-sans text-xs lg:text-sm font-normal tracking-wider uppercase transition-colors"
          >
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Vertical separator on desktop */}
      <div className="hidden lg:block w-px bg-border/60 self-stretch" />

      {/* =========================================================================
          RIGHT CONTENT PANE
      ========================================================================== */}
      <section className="flex flex-1 flex-col w-full">
        {/* Desktop Tabs Header (Pill Style) */}
        <div className="hidden lg:flex items-center justify-end gap-3 pb-6">
          {TABS.map((value) => {
            const isActive = tab === value;
            return (
              <button
                key={value}
                type="button"
                data-testid="profile-page__tab"
                data-entity-id={value}
                onClick={() => setTab(value)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-sans text-xs lg:text-sm font-normal tracking-wider uppercase transition-colors",
                  isActive
                    ? "bg-[#F2EDE5] text-foreground font-normal"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#F2EDE5]/40",
                )}
              >
                {value === "travels" ? "Travel" : value}
              </button>
            );
          })}
        </div>

        {/* Mobile Tabs Header (Underline Style) */}
        <div className="border-border flex lg:hidden items-center justify-between border-b px-6 pt-5 bg-background">
          {TABS.map((value) => (
            <button
              key={value}
              type="button"
              data-testid="profile-page__tab"
              data-entity-id={value}
              onClick={() => setTab(value)}
              className={cn(
                "pb-3 font-sans text-base lg:text-xl font-normal tracking-wider uppercase transition-colors",
                tab === value
                  ? "text-foreground border-foreground border-b-2 font-normal"
                  : "text-muted-foreground",
              )}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="relative flex flex-1 flex-col px-6 lg:px-0 py-6">
          {/* FAVORITE TAB */}
          {tab === "favorite" && (
            <div className="flex flex-col gap-6">
              {/* Sub-filters row */}
              <div className="flex gap-2">
                {FAVORITE_FILTERS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    data-testid="profile-page__favorite-filter"
                    data-entity-id={value}
                    onClick={() => setFavoriteFilter(value)}
                    className={cn(
                      "rounded-full border px-4 py-2 font-sans text-xs lg:text-sm font-normal tracking-wider uppercase transition-colors",
                      favoriteFilter === value
                        ? "border-foreground text-foreground border-2"
                        : "border-border text-muted-foreground hover:border-foreground/40",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {visibleFavorites.length === 0 ? (
                <Typography variant="subtitle" className="py-20 text-center">
                  Nothing favorited yet.
                </Typography>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {visibleFavorites.map((entry) => (
                    <div
                      key={entry.id}
                      data-testid="profile-page__favorite-item"
                      data-entity-id={entry.id}
                      className="group border border-[#EAE4DC] bg-[#FAF8F5] hover:border-foreground/30 hover:shadow-sm flex flex-col rounded-2xl p-4 transition-colors"
                    >
                      <div className="relative aspect-square w-full rounded-xl flex items-center justify-center">
                        {entry.image_url ? (
                          <Image
                            src={entry.image_url}
                            alt={entry.name ?? ""}
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-contain p-2 drop-shadow-sm"
                          />
                        ) : (
                          <div className="size-full bg-secondary/40 rounded-xl" />
                        )}
                        <Heart className="fill-primary-pink text-primary-pink absolute top-2 right-2 size-5" />
                      </div>
                      <div className="mt-3 flex flex-col">
                        <Typography
                          variant="h1"
                          as="p"
                          className="font-serif text-base lg:text-lg font-normal text-foreground leading-snug"
                        >
                          {entry.name ?? "Untitled"}
                        </Typography>
                        <span className="font-sans text-[11px] lg:text-xs font-normal uppercase tracking-wider text-muted-foreground">
                          Outfit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRAVEL TAB */}
          {tab === "travels" && (
            <div className="flex flex-col gap-6">
              {trips.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
                  <div className="relative h-32 w-32">
                    <Image
                      src="/profile/koper.png"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Typography variant="subtitle">No trips yet.</Typography>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {trips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/trip/${trip.id}`}
                      prefetch
                      data-testid="profile-page__trip-item"
                      data-entity-id={trip.id}
                      className="group flex flex-col items-center gap-3 text-center"
                    >
                      <div className="relative aspect-square w-full max-w-[200px]">
                        <Image
                          src="/profile/koper.png"
                          alt=""
                          fill
                          className="object-contain drop-shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Typography
                          variant="h1"
                          as="p"
                          className="font-serif text-2xl lg:text-[28px] font-normal tracking-tight text-foreground"
                        >
                          {trip.name ?? "Untitled trip"}
                        </Typography>
                        <span className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground">
                          {formatTripMonthYear(trip.start_date)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Add Trip Floating Button (Mobile) & Inline CTA */}
              <Link
                href="/trip/new"
                prefetch
                aria-label="Add trip"
                className="bg-foreground text-background fixed right-6 bottom-24 flex size-14 items-center justify-center rounded-2xl shadow-lg lg:hidden"
              >
                <Plus className="size-6" />
              </Link>
            </div>
          )}

          {/* WISHLIST TAB */}
          {tab === "wishlist" && (
            <div className="flex flex-col gap-6">
              {/* Sub-filters row */}
              <div className="flex gap-2">
                {WISHLIST_FILTERS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    data-testid="profile-page__wishlist-filter"
                    data-entity-id={value}
                    onClick={() => setWishlistFilter(value)}
                    className={cn(
                      "rounded-full border px-4 py-2 font-sans text-xs lg:text-sm font-normal tracking-wider uppercase transition-colors",
                      wishlistFilter === value
                        ? "border-foreground text-foreground border-2"
                        : "border-border text-muted-foreground hover:border-foreground/40",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {wishlist.length === 0 ? (
                <Typography variant="subtitle" className="py-20 text-center">
                  Nothing on your wishlist yet.
                </Typography>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {wishlist.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      data-testid="profile-page__wishlist-item"
                      data-entity-id={entry.id}
                      onClick={() => setSelectedWishlistItem(entry)}
                      className="group border border-[#EAE4DC] bg-[#FAF8F5] hover:border-foreground/30 hover:shadow-sm flex flex-col text-left rounded-2xl p-4 transition-colors"
                    >
                      <div className="relative aspect-square w-full rounded-xl flex items-center justify-center">
                        {entry.image_url ? (
                          <Image
                            src={entry.image_url}
                            alt={entry.name ?? ""}
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-contain p-2 drop-shadow-sm"
                          />
                        ) : (
                          <div className="size-full bg-secondary/40 rounded-xl" />
                        )}
                        <Heart className="fill-primary-pink text-primary-pink absolute top-2 right-2 size-5" />
                      </div>
                      <div className="mt-3 flex flex-col">
                        <Typography
                          variant="h1"
                          as="p"
                          className="font-serif text-base lg:text-lg font-normal text-foreground leading-snug"
                        >
                          {entry.name ?? "Untitled"}
                        </Typography>
                        <span className="font-sans text-[11px] lg:text-xs font-normal uppercase tracking-wider text-muted-foreground">
                          Wishlist
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add To Wardrobe Dialog */}
      <AddToWardrobeDialog
        item={selectedWishlistItem}
        open={!!selectedWishlistItem}
        onOpenChange={(open) => !open && setSelectedWishlistItem(null)}
        onAddToWardrobe={handleAddToWardrobe}
      />
    </main>
  );
}
