"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Repeat } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { getFavoriteOutfitsQueryOptionsForBrowser } from "./query-options/get-favorite-outfits.query-option.client";
import { ProfileBreadcrumb } from "./components/profile-breadcrumb";

const TABS = ["outfit", "repost"] as const;
type SocialTab = (typeof TABS)[number];

export function SocialProfileView({ userId }: { userId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<SocialTab>("outfit");

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  const { data: outfits } = useSuspenseQuery(
    getFavoriteOutfitsQueryOptionsForBrowser(userId),
  );

  const username = profile?.username ?? "you";
  const displayName = profile?.display_name ?? username;
  const profilePhoto = profile?.profile_photo ?? null;
  const initials = (displayName ?? username).slice(0, 2).toUpperCase();

  return (
    <main className="mx-auto flex w-full max-w-[402px] lg:max-w-[1088px] flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb (desktop) */}
      <ProfileBreadcrumb
        items={[
          { label: "PROFILE", href: "/profile" },
          { label: "SOCIAL CIRCLE" },
        ]}
      />

      {/* Mobile back button */}
      <div className="flex items-center justify-between lg:hidden">
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
      </div>

      {/* User Header Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8">
        <Avatar className="size-28 lg:size-36 rounded-3xl bg-[#A2C4B7] shadow-sm">
          <AvatarImage
            src={profilePhoto ?? undefined}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="rounded-3xl bg-[#A2C4B7] text-white text-3xl font-serif">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center sm:items-start gap-3">
          <span className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground">
            @{username}
          </span>
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] lg:text-4xl font-normal leading-tight text-foreground"
          >
            {displayName}
          </Typography>

          {/* Social Stats */}
          <div className="flex items-center gap-6 pt-1 text-sm text-foreground/80">
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-serif text-lg font-normal text-foreground">100</span>
              <span className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground">
                following
              </span>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-serif text-lg font-normal text-foreground">14k</span>
              <span className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground">
                followers
              </span>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-serif text-lg font-normal text-foreground">2m</span>
              <span className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground">
                likes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60 flex items-center gap-8 pt-4">
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "pb-3 font-sans text-xs font-normal tracking-wider uppercase transition-colors relative",
              tab === value
                ? "text-foreground border-b-2 border-foreground font-normal"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Outfits Grid */}
      {tab === "outfit" && (
        outfits.length === 0 ? (
          <Typography variant="subtitle" className="py-20 text-center">
            No outfits published yet.
          </Typography>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {outfits.map((entry, index) => (
              <div
                key={entry.id}
                className="group border border-[#EAE4DC] bg-[#FAF8F5] hover:border-foreground/30 hover:shadow-sm flex flex-col justify-between rounded-2xl p-4 transition-colors"
              >
                <div className="relative aspect-[3/4] w-full flex items-center justify-center mb-3">
                  {entry.image_url ? (
                    <Image
                      src={entry.image_url}
                      alt={entry.name ?? "Outfit"}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-contain drop-shadow-sm"
                    />
                  ) : (
                    <div className="size-full bg-secondary/50 rounded-xl" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-[#EAE4DC]/60">
                  <div className="flex items-center gap-1.5 font-normal text-foreground/80">
                    <Heart
                      className={cn(
                        "size-3.5",
                        index === 0
                          ? "text-foreground/70"
                          : "fill-primary-pink text-primary-pink",
                      )}
                    />
                    <span>{index === 0 ? "11.3 K" : "123"}</span>
                  </div>
                  <Repeat className="size-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "repost" && (
        <Typography variant="subtitle" className="py-20 text-center">
          No reposts yet.
        </Typography>
      )}
    </main>
  );
}
