"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Pencil, Plus, Sparkle } from "lucide-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { ProfileBreadcrumb } from "@/domains/profile/components/profile-breadcrumb";
import { formatDayDate, formatTripMonthYear } from "./trip-dates";
import { getTripDetailQueryOptionsForBrowser } from "./query-options/get-trip-detail.query-option.client";
import { getTripPackingItemsQueryOptionsForBrowser } from "./query-options/get-trip-packing-items.query-option.client";
import { addTripPackingItemMutationOptions } from "./mutation-options/add-trip-packing-item.mutation-option.client";
import { toggleTripPackingItemMutationOptions } from "./mutation-options/toggle-trip-packing-item.mutation-option.client";
import { PlanOutfitDialog } from "./components/plan-outfit-dialog";
import type { TripPackingItem } from "./types";

const TABS = ["outfit-plan", "packing-list"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  "outfit-plan": "Outfit Plan",
  "packing-list": "Packing List",
};

export function TripDetailView({
  userId,
  tripId,
}: {
  userId: string;
  tripId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("outfit-plan");
  const [newItemName, setNewItemName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [planOutfitDay, setPlanOutfitDay] = useState<string | null>(null);

  const { data } = useSuspenseQuery(
    getTripDetailQueryOptionsForBrowser(userId, tripId),
  );

  const { data: packingItems = [] } = useSuspenseQuery(
    getTripPackingItemsQueryOptionsForBrowser(userId, tripId),
  );

  if (!data) {
    notFound();
  }

  const { trip, days, outfitsByDay } = data;

  const addPackingItemMutation = useMutation({
    ...addTripPackingItemMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getTripPackingItemsQueryOptionsForBrowser(userId, tripId)
          .queryKey,
      });
      setNewItemName("");
      setIsAddingItem(false);
    },
    onError: () => {
      toast.error("Couldn't add that packing item.");
    },
  });

  const togglePackingItemMutation = useMutation({
    ...toggleTripPackingItemMutationOptions(),
    onMutate: async ({ id, isPacked }) => {
      const queryKey = getTripPackingItemsQueryOptionsForBrowser(
        userId,
        tripId,
      ).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: TripPackingItem[] = []) =>
        old.map((item) => (item.id === id ? { ...item, isPacked } : item)),
      );
      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.error("Couldn't update packing item.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: getTripPackingItemsQueryOptionsForBrowser(userId, tripId)
          .queryKey,
      });
    },
  });

  function togglePacked(item: TripPackingItem) {
    togglePackingItemMutation.mutate({
      id: item.id,
      userId,
      isPacked: !item.isPacked,
    });
  }

  function handleAddPackingItem() {
    if (!newItemName.trim() || addPackingItemMutation.isPending) return;
    addPackingItemMutation.mutate({
      tripId,
      userId,
      name: newItemName.trim(),
    });
  }

  const subtitleParts = [
    trip.season ? trip.season.charAt(0).toUpperCase() + trip.season.slice(1) : null,
    trip.travel_companion ? trip.travel_companion.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : null,
  ].filter(Boolean);

  return (
    <main
      className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12"
      data-testid="trip-detail"
      data-entity-id={trip.id}
    >
      {/* Top Header / Breadcrumb & Mobile Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl lg:hidden"
            onClick={() => router.back()}
            aria-label="Go back"
            data-testid="trip-detail__back-button"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <ProfileBreadcrumb
            items={[
              { label: "PROFILE", href: "/profile" },
              { label: "TRAVEL DETAIL" },
            ]}
          />
        </div>

        {/* Mobile edit button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl lg:hidden"
          nativeButton={false}
          data-testid="trip-detail__edit-button"
          render={
            <Link
              href={`/trip/${trip.id}/edit`}
              prefetch
              aria-label="Edit trip"
            />
          }
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      {/* Hero Trip Info Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-36 w-36 lg:h-44 lg:w-44">
          <Image
            src="/profile/koper.png"
            alt=""
            fill
            className="object-contain drop-shadow-md"
          />
        </div>

        {/* Desktop Edit Details Pill Button */}
        <Link
          href={`/trip/${trip.id}/edit`}
          prefetch
          className="hidden lg:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] font-sans text-xs font-normal tracking-wider uppercase transition-colors"
        >
          <Pencil className="size-3" />
          <span>Edit Details</span>
        </Link>

        <div className="flex flex-col items-center gap-1">
          <Typography
            variant="title"
            as="h1"
            data-testid="trip-detail__title"
            className="font-serif text-[32px] lg:text-[44px] font-normal leading-tight text-foreground"
          >
            {trip.name ?? "Untitled trip"}
          </Typography>
          <Typography
            variant="subtitle"
            data-testid="trip-detail__days-count"
            className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground pt-1"
          >
            {days.length} {days.length === 1 ? "Day" : "Days"}
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-sans text-xs font-normal text-muted-foreground/80 tracking-wide uppercase">
            <span>{formatTripMonthYear(trip.start_date)}</span>
            {subtitleParts.map((part) => (
              <span key={part}>• {part}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-center pt-2">
        {/* Desktop pill style */}
        <div className="hidden lg:flex items-center gap-3">
          {TABS.map((value) => {
            const isActive = tab === value;
            return (
              <button
                key={value}
                type="button"
                data-testid="trip-detail__tab"
                data-entity-id={value}
                onClick={() => setTab(value)}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-sans text-xs lg:text-sm font-normal tracking-wider uppercase transition-colors",
                  isActive
                    ? "bg-[#F2EDE5] text-foreground font-normal"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#F2EDE5]/40",
                )}
              >
                {TAB_LABEL[value]}
              </button>
            );
          })}
        </div>

        {/* Mobile underline style */}
        <div className="border-border flex lg:hidden items-center justify-between border-b w-full">
          {TABS.map((value) => (
            <button
              key={value}
              type="button"
              data-testid="trip-detail__tab"
              data-entity-id={value}
              onClick={() => setTab(value)}
              className={cn(
                "pb-3 font-sans text-base lg:text-xl font-normal tracking-wider uppercase transition-colors",
                tab === value
                  ? "text-foreground border-foreground border-b-2 font-medium"
                  : "text-muted-foreground",
              )}
            >
              {TAB_LABEL[value]}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OUTFIT PLAN */}
      {tab === "outfit-plan" && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-4"
          data-testid="trip-detail__outfit-plan"
        >
          {days.map((day, index) => {
            const outfits = outfitsByDay[day] ?? [];
            const isLast = index === days.length - 1;
            return (
              <div
                key={day}
                className="relative flex gap-4 pb-8"
                data-testid="trip-detail__day-item"
                data-entity-id={day}
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className="border-[#C9C3B7] absolute top-7 bottom-0 left-2.5 border-l border-dashed"
                  />
                )}
                <Sparkle className="text-foreground mt-1 size-5 shrink-0" />
                <div className="flex flex-1 flex-col gap-4">
                  <Typography
                    variant="h1"
                    as="h2"
                    data-testid="trip-detail__day-title"
                    className="font-serif text-xl lg:text-2xl font-normal text-foreground"
                  >
                    Day {index + 1} - {formatDayDate(day)}
                  </Typography>

                  {outfits.map((outfit) => (
                    <OutfitComposition
                      key={outfit.wearLogId}
                      items={outfit.items}
                      className="aspect-5/6 w-full max-w-sm rounded-2xl overflow-hidden border border-[#EAE4DC]"
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => setPlanOutfitDay(day)}
                    className="w-full lg:w-auto text-center border border-[#C9C3B7] lg:border-none lg:bg-[#383733] lg:hover:bg-[#2A2926] lg:text-white text-[#444440] hover:bg-[#F2EDE5]/50 rounded-xl px-6 py-2.5 font-sans text-xs font-normal tracking-wider uppercase transition-colors shadow-xs"
                    data-testid="trip-detail__plan-outfit-button"
                  >
                    Plan Outfit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PACKING LIST */}
      {tab === "packing-list" && (
        <div className="flex flex-col items-start max-w-md mx-auto w-full gap-4 pt-4">
          <div className="flex flex-col w-full gap-3">
            {packingItems.length === 0 ? (
              <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground py-6 text-center">
                No items added yet. Click + below to start your packing list.
              </p>
            ) : (
              packingItems.map((item) => (
                <label
                  key={item.id}
                  data-testid="trip-detail__packing-item"
                  data-entity-id={item.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-[#F2EDE5]/40 cursor-pointer select-none transition-colors"
                >
                  <Checkbox
                    checked={item.isPacked}
                    onCheckedChange={() => togglePacked(item)}
                    className="size-5 rounded-md"
                  />
                  <span className="font-sans text-sm md:text-base font-normal tracking-wider uppercase text-foreground transition-all">
                    {item.name}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Add Item form */}
          {isAddingItem ? (
            <div className="flex items-center gap-2 w-full pt-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPackingItem()}
                placeholder="Item name (e.g. Wool Scarf)"
                data-testid="trip-detail__new-packing-input"
                className="flex-1 bg-[#F2EDE5] text-xs uppercase px-4 py-3 rounded-xl outline-none placeholder:text-muted-foreground text-foreground"
                autoFocus
              />
              <Button
                type="button"
                disabled={addPackingItemMutation.isPending}
                onClick={handleAddPackingItem}
                data-testid="trip-detail__submit-packing-button"
                className="bg-[#383733] hover:bg-[#2A2926] text-white text-xs uppercase py-3 rounded-xl px-5"
              >
                {addPackingItemMutation.isPending ? "Adding…" : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddingItem(false)}
                className="text-xs uppercase"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingItem(true)}
              data-testid="trip-detail__add-packing-button"
              className="bg-[#383733] hover:bg-[#2A2926] text-white flex size-10 items-center justify-center rounded-xl transition-colors shadow-sm mt-2"
              aria-label="Add packing item"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* Plan Outfit Modal */}
      <PlanOutfitDialog
        tripId={trip.id}
        day={planOutfitDay}
        open={!!planOutfitDay}
        onOpenChange={(open) => !open && setPlanOutfitDay(null)}
      />
    </main>
  );
}
