"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Pencil, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { formatTripMonthYear } from "@/components/features/trip/trip-dates";
import type { Trip } from "@/components/features/trip/types";
import type { FavoriteEntry, WishlistEntry } from "./types";

const TABS = ["favorite", "travels", "wishlist"] as const;
type Tab = (typeof TABS)[number];

const FAVORITE_FILTERS = ["all", "wardrobe", "outfit"] as const;
type FavoriteFilter = (typeof FAVORITE_FILTERS)[number];

function notImplemented() {
  toast("Coming soon.");
}

export function ProfileView({
  username,
  displayName,
  profilePhoto,
  outfitSize,
  shoeSize,
  favorites,
  wishlist,
  trips,
}: {
  username: string;
  displayName: string | null;
  profilePhoto: string | null;
  outfitSize: string | null;
  shoeSize: string | null;
  favorites: FavoriteEntry[];
  wishlist: WishlistEntry[];
  trips: Trip[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("favorite");
  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("all");

  const initials = (displayName ?? username).slice(0, 2).toUpperCase();
  const sizeLine = [outfitSize?.toUpperCase(), shoeSize].filter(Boolean).join(" · ");
  // Wardrobe-item-level favoriting doesn't exist yet (no such column) --
  // the "wardrobe" filter is real UI, just always empty for now.
  const visibleFavorites = favoriteFilter === "wardrobe" ? [] : favorites;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col">
      <div className="relative h-60 w-full">
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
              <Avatar size="lg" className="border-background size-18 rounded-2xl border-2">
                <AvatarImage src={profilePhoto ?? undefined} alt="" />
                <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => router.push("/profile/edit")}
                aria-label="Edit profile"
                className="bg-background absolute -bottom-2 -left-2 flex size-7 items-center justify-center rounded-full shadow"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={notImplemented}
              aria-label="Friends"
              className="bg-secondary/90 flex size-10 items-center justify-center rounded-xl"
            >
              <Users className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-xs tracking-wide text-white/90 uppercase">
              @{username}
            </span>
            <Typography variant="title" as="p" className="text-white">
              {displayName ?? username}
            </Typography>
            {sizeLine && <span className="text-xs text-white/90">{sizeLine}</span>}
          </div>
        </div>
      </div>

      <div className="border-border flex items-center justify-between border-b px-6 pt-5">
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "pb-3 text-sm font-medium tracking-wide uppercase transition-colors",
              tab === value
                ? "text-foreground border-foreground border-b-2"
                : "text-muted-foreground",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="relative flex flex-1 flex-col px-6 py-6">
        {tab === "favorite" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {FAVORITE_FILTERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFavoriteFilter(value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-medium tracking-wide uppercase transition-colors",
                    favoriteFilter === value
                      ? "border-foreground text-foreground border-2"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>

            {visibleFavorites.length === 0 ? (
              <Typography variant="subtitle" className="py-16 text-center">
                Nothing favorited yet.
              </Typography>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {visibleFavorites.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <div className="bg-secondary relative aspect-square overflow-hidden rounded-2xl">
                      {entry.image_url && (
                        <Image
                          src={entry.image_url}
                          alt={entry.name ?? ""}
                          fill
                          className="object-contain p-3"
                        />
                      )}
                      <Heart className="fill-primary-pink text-primary-pink absolute top-2 right-2 size-5" />
                    </div>
                    <div>
                      <Typography variant="h1" as="p">
                        {entry.name ?? "Untitled"}
                      </Typography>
                      <span className="text-muted-foreground text-xs">Outfit</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "travels" &&
          (trips.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="relative h-28 w-28">
                <Image src="/profile/koper.png" alt="" fill className="object-contain" />
              </div>
              <Typography variant="subtitle">No trips yet.</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => router.push(`/trip/${trip.id}`)}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src="/profile/koper.png"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Typography variant="h1" as="p">
                    {trip.name ?? "Untitled trip"}
                  </Typography>
                  <span className="text-muted-foreground text-xs tracking-wide uppercase">
                    {formatTripMonthYear(trip.start_date)}
                  </span>
                </button>
              ))}
            </div>
          ))}

        {tab === "wishlist" &&
          (wishlist.length === 0 ? (
            <Typography variant="subtitle" className="py-16 text-center">
              Nothing on your wishlist yet.
            </Typography>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wishlist.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-2">
                  <div className="bg-secondary relative aspect-square overflow-hidden rounded-2xl">
                    {entry.image_url && (
                      <Image
                        src={entry.image_url}
                        alt={entry.name ?? ""}
                        fill
                        className="object-contain p-3"
                      />
                    )}
                  </div>
                  <Typography variant="h1" as="p">
                    {entry.name ?? "Untitled"}
                  </Typography>
                </div>
              ))}
            </div>
          ))}

        {tab === "travels" && (
          <button
            type="button"
            onClick={() => router.push("/trip/new")}
            aria-label="Add trip"
            className="bg-foreground text-background fixed right-6 bottom-24 flex size-14 items-center justify-center rounded-2xl shadow-lg"
          >
            <Plus className="size-6" />
          </button>
        )}
      </div>
    </main>
  );
}
