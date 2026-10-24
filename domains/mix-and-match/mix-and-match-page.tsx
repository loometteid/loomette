"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Shuffle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getMixAndMatchOptionsQueryOptionsForBrowser } from "./query-options/get-mix-and-match-options.query-option.client";
import { saveOutfitMutationOptions } from "./mutation-options/save-outfit.mutation-option.client";
import { getTripsQueryOptionsForBrowser } from "@/domains/profile/query-options/get-trips.query-option.client";
import { getTripDetailQueryOptionsForBrowser } from "@/domains/trip/query-options/get-trip-detail.query-option.client";
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS } from "@/domains/wardrobe/types";
import { DEFAULT_SLOT_POSITIONS } from "@/domains/outfit/components/outfit-composition";
import {
  KonvaCanvas,
  type KonvaCanvasHandle,
} from "./components/konva-canvas";
import type { CanvasItem, WardrobeOption } from "./types";
import type { Route } from "next";

const DRAG_THRESHOLD_PX = 6;

type GhostDrag = {
  option: WardrobeOption;
  clientX: number;
  clientY: number;
  dragging: boolean;
};

export function MixAndMatchCanvas({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: wardrobeOptions } = useSuspenseQuery(
    getMixAndMatchOptionsQueryOptionsForBrowser(userId),
  );

  const tripId = searchParams.get("tripId");
  const tripDay = searchParams.get("day");
  const returnTo = searchParams.get("returnTo");

  const konvaCanvasRef = useRef<KonvaCanvasHandle>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(
    CATEGORY_OPTIONS[0].value,
  );

  // Expanded subcategories per category
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const defaultSubcats = SUBCATEGORY_OPTIONS[CATEGORY_OPTIONS[0].value];
    if (defaultSubcats && defaultSubcats.length > 0) {
      return new Set([defaultSubcats[0].value]);
    }
    const firstOption = wardrobeOptions.find(
      (opt) => opt.category === CATEGORY_OPTIONS[0].value,
    );
    return firstOption ? new Set([firstOption.subcategory]) : new Set();
  });

  const [ghost, setGhost] = useState<GhostDrag | null>(null);

  // Gather subcategories for active category: combine standard ones with any present in wardrobe
  const subcategoryList = useMemo(() => {
    const standard = (SUBCATEGORY_OPTIONS[activeCategory] ?? []).map(
      (s) => s.value,
    );
    const existing = new Set<string>(standard);

    for (const opt of wardrobeOptions) {
      if (opt.category === activeCategory && opt.subcategory) {
        existing.add(opt.subcategory);
      }
    }

    return Array.from(existing);
  }, [activeCategory, wardrobeOptions]);

  // Group items by subcategory (normalized case-insensitively)
  const itemsBySubcategory = useMemo(() => {
    const map = new Map<string, WardrobeOption[]>();
    for (const sub of subcategoryList) {
      map.set(sub, []);
    }

    for (const opt of wardrobeOptions) {
      if (opt.category !== activeCategory) continue;
      const targetSub =
        subcategoryList.find(
          (s) => s.toLowerCase() === opt.subcategory.toLowerCase(),
        ) ?? opt.subcategory;

      const list = map.get(targetSub) ?? [];
      list.push(opt);
      map.set(targetSub, list);
    }

    return map;
  }, [activeCategory, subcategoryList, wardrobeOptions]);

  // Set of IDs currently on canvas for quick lookup
  const canvasItemIds = useMemo(
    () => new Set(canvasItems.map((item) => item.wardrobeItemId)),
    [canvasItems],
  );

  // Keyboard shortcut: Delete or Backspace removes selected item
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!selectedId) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
          return;
        }
        event.preventDefault();
        konvaCanvasRef.current?.deleteSelected();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  // Drag or tap a wardrobe item from the picker onto the canvas
  function handlePickerPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    option: WardrobeOption,
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setGhost({
      option,
      clientX: event.clientX,
      clientY: event.clientY,
      dragging: false,
    });
  }

  function handlePickerPointerMove(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    setGhost((prev) => {
      if (!prev) return prev;
      const dx = Math.abs(event.clientX - prev.clientX);
      const dy = Math.abs(event.clientY - prev.clientY);
      const dragging =
        prev.dragging || dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX;
      return {
        ...prev,
        clientX: event.clientX,
        clientY: event.clientY,
        dragging,
      };
    });
  }

  function handlePickerPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    const current = ghost;
    setGhost(null);
    if (!current) return;

    const container = canvasContainerRef.current;
    if (!container) return;

    if (!current.dragging) {
      // Tap action: place at default slot position
      const slot = DEFAULT_SLOT_POSITIONS[current.option.category] ?? {
        x: 0.5,
        y: 0.5,
      };
      konvaCanvasRef.current?.addItem(current.option, slot.x, slot.y);
      return;
    }

    // Drag-and-drop action: check if dropped inside canvas bounding box
    const rect = container.getBoundingClientRect();
    const insideCanvas =
      current.clientX >= rect.left &&
      current.clientX <= rect.right &&
      current.clientY >= rect.top &&
      current.clientY <= rect.bottom;

    if (insideCanvas) {
      const x = (current.clientX - rect.left) / rect.width;
      const y = (current.clientY - rect.top) / rect.height;
      konvaCanvasRef.current?.addItem(current.option, x, y);
    }
  }

  function handleDeleteSelected() {
    konvaCanvasRef.current?.deleteSelected();
  }

  function handleMoveLayer(direction: "up" | "down") {
    konvaCanvasRef.current?.moveLayer(direction);
  }

  function handleShuffle() {
    const slotCategories = ["Tops", "Bottoms", "Shoes"] as const;
    const pieces: Array<{ option: WardrobeOption; x: number; y: number }> = [];

    for (const category of slotCategories) {
      const options = wardrobeOptions.filter((o) => o.category === category);
      if (options.length === 0) continue;
      const choice = options[Math.floor(Math.random() * options.length)];
      const slot = DEFAULT_SLOT_POSITIONS[category];
      pieces.push({
        option: choice,
        x: Math.min(1, Math.max(0, slot.x + (Math.random() - 0.5) * 0.08)),
        y: Math.min(1, Math.max(0, slot.y + (Math.random() - 0.5) * 0.06)),
      });
    }

    const accessoryOptions = wardrobeOptions.filter(
      (o) => o.category === "Accessories",
    );
    if (accessoryOptions.length > 0 && Math.random() > 0.3) {
      const choice =
        accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)];
      const slot = DEFAULT_SLOT_POSITIONS.Accessories;
      pieces.push({
        option: choice,
        x: Math.min(1, Math.max(0, slot.x + (Math.random() - 0.5) * 0.05)),
        y: Math.min(1, Math.max(0, slot.y + (Math.random() - 0.5) * 0.05)),
      });
    }

    if (pieces.length === 0) {
      toast.error("Add some wardrobe items first.");
      return;
    }

    konvaCanvasRef.current?.shuffle(pieces);
  }

  const saveMutation = useMutation({
    ...saveOutfitMutationOptions(),
    onSuccess: (data) => {
      if (tripId && tripDay) {
        void queryClient.invalidateQueries({
          queryKey: getTripsQueryOptionsForBrowser(userId).queryKey,
        });
        void queryClient.invalidateQueries({
          queryKey: getTripDetailQueryOptionsForBrowser(userId, tripId).queryKey,
        });
        toast.success("Outfit added to your trip.");
        router.push((returnTo as Route) ?? `/trip/${tripId}`);
        return;
      }
      router.push(`/mix-and-match/result/${data.outfitId}`);
    },
    onError: () => {
      toast.error("Couldn't save that outfit.");
    },
  });

  function handleSave() {
    const currentItems = konvaCanvasRef.current?.getItems() ?? canvasItems;
    if (currentItems.length === 0) {
      toast.error("Add at least one item to your canvas first.");
      return;
    }

    saveMutation.mutate({
      userId,
      items: currentItems,
      tripId,
      tripDay,
    });
  }

  return (
    <main
      className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-6 lg:gap-8 px-4 sm:px-6 lg:px-12 py-6 lg:py-10"
      data-testid="mix-and-match"
    >
      {/* Mobile Back Button */}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-10 rounded-xl bg-linen text-foreground hover:bg-linen-dark lg:hidden self-start cursor-pointer"
        onClick={() => router.back()}
        aria-label="Go back"
        data-testid="mix-and-match__back-button"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* Header Bar matching Figma 3.4.1 & D.3.4.1 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:gap-4">
          <Sparkle className="size-6 lg:size-8 text-foreground shrink-0" />
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal leading-tight text-foreground"
            data-testid="mix-and-match__title"
          >
            Mix &amp; Match
          </Typography>
        </div>

        {/* Action buttons (Trash & Shuffle) */}
        <div className="flex items-center gap-2.5 lg:gap-3.5">
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!selectedId}
            aria-label="Delete selected item"
            data-testid="mix-and-match__trash-button"
            className="bg-linen hover:bg-linen-dark text-foreground flex size-10 lg:size-14 items-center justify-center rounded-xl lg:rounded-2xl transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="size-4 lg:size-6" />
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            aria-label="Shuffle outfit"
            data-testid="mix-and-match__shuffle-button"
            className="bg-linen hover:bg-linen-dark text-foreground flex size-10 lg:size-14 items-center justify-center rounded-xl lg:rounded-2xl transition-colors cursor-pointer"
          >
            <Shuffle className="size-4 lg:size-6" />
          </button>
        </div>
      </div>

      {/* Main Responsive 2-Column Grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 xl:gap-16 pt-2">
        {/* Left Column: Canvas + Canvas Controls */}
        <div className="w-full lg:w-[480px] xl:w-[560px] shrink-0 flex flex-col gap-4">
          <div ref={canvasContainerRef} className="relative">
            {/* Pure Konva Interactive Canvas with Transformer */}
            <KonvaCanvas
              ref={konvaCanvasRef}
              onItemsChange={setCanvasItems}
              onSelectionChange={setSelectedId}
              className="border-border bg-background relative aspect-square w-full touch-none overflow-hidden rounded-2xl border"
            />

            {/* Bottom floating canvas action buttons */}
            <div className="absolute bottom-3 left-3 flex gap-2 z-10 pointer-events-auto">
              <button
                type="button"
                onClick={() => handleMoveLayer("up")}
                disabled={!selectedId}
                aria-label="Bring forward"
                data-testid="mix-and-match__layer-up-button"
                className="bg-linen hover:bg-linen-dark text-foreground flex size-9 lg:size-12 items-center justify-center rounded-xl lg:rounded-2xl shadow-sm transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronUp className="size-4 lg:size-6" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveLayer("down")}
                disabled={!selectedId}
                aria-label="Send backward"
                data-testid="mix-and-match__layer-down-button"
                className="bg-linen hover:bg-linen-dark text-foreground flex size-9 lg:size-12 items-center justify-center rounded-xl lg:rounded-2xl shadow-sm transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronDown className="size-4 lg:size-6" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-testid="mix-and-match__save-button"
              className="bg-primary hover:bg-primary/90 text-white absolute right-3.5 bottom-3.5 rounded-xl lg:rounded-2xl px-6 lg:px-10 h-10 lg:h-14 text-xs lg:text-sm font-semibold tracking-wider uppercase shadow-sm transition-colors disabled:opacity-60 cursor-pointer z-10 pointer-events-auto"
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Right Column: Garment Picker & Categories */}
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 bg-linen lg:bg-transparent rounded-3xl p-4 sm:p-5 lg:p-0">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                data-testid="mix-and-match__category-tab"
                data-entity-id={category.value}
                className={cn(
                  "shrink-0 rounded-2xl border px-4 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-medium tracking-wide uppercase transition-colors cursor-pointer",
                  activeCategory === category.value
                    ? "border-foreground text-foreground border-2 bg-background/60 font-semibold"
                    : "border-border text-foreground/70 hover:text-foreground",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Subcategories Accordion */}
          <div className="flex flex-col">
            {subcategoryList.map((subcategory) => {
              const options = itemsBySubcategory.get(subcategory) ?? [];
              const isExpanded = expanded.has(subcategory);

              return (
                <div
                  key={subcategory}
                  className="border-border border-b py-3 lg:py-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(subcategory)) next.delete(subcategory);
                        else next.add(subcategory);
                        return next;
                      })
                    }
                    data-testid="mix-and-match__subcategory-toggle"
                    data-entity-id={subcategory}
                    className="flex w-full items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-xs lg:text-sm font-semibold tracking-wider uppercase text-foreground">
                      {subcategory}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="text-muted-foreground group-hover:text-foreground size-4 lg:size-5 transition-colors" />
                    ) : (
                      <ChevronDown className="text-muted-foreground group-hover:text-foreground size-4 lg:size-5 transition-colors" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 lg:mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 lg:gap-4">
                      {options.map((option) => {
                        const isOnCanvas = canvasItemIds.has(
                          option.wardrobeItemId,
                        );

                        return (
                          <button
                            key={option.wardrobeItemId}
                            type="button"
                            onPointerDown={(event) =>
                              handlePickerPointerDown(event, option)
                            }
                            onPointerMove={handlePickerPointerMove}
                            onPointerUp={handlePickerPointerUp}
                            data-testid="mix-and-match__picker-item"
                            data-entity-id={option.wardrobeItemId}
                            className={cn(
                              "relative aspect-square w-full shrink-0 touch-none overflow-hidden rounded-2xl bg-background p-2 transition-all cursor-pointer flex items-center justify-center",
                              isOnCanvas
                                ? "border-2 border-foreground shadow-sm"
                                : "border border-linen-dark hover:border-foreground/40",
                            )}
                          >
                            {option.image_url && (
                              <Image
                                src={option.image_url}
                                alt={option.name ?? ""}
                                fill
                                className="pointer-events-none object-contain p-1 select-none"
                                sizes="120px"
                              />
                            )}
                          </button>
                        );
                      })}

                      {options.length === 0 && (
                        <p className="col-span-full py-4 text-center font-sans text-xs text-muted-foreground">
                          No {subcategory.toLowerCase()} items in wardrobe.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {subcategoryList.length === 0 && (
              <Typography variant="subtitle" className="py-6 text-center">
                No items in this category yet.
              </Typography>
            )}
          </div>
        </div>
      </div>

      {/* Floating Ghost Element during drag from picker onto canvas */}
      {ghost && ghost.dragging && (
        <div
          style={{
            left: ghost.clientX,
            top: ghost.clientY,
            width: 76,
            height: 76,
          }}
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-85 select-none"
        >
          {ghost.option.image_url && (
            <Image
              src={ghost.option.image_url}
              alt=""
              fill
              className="object-contain"
              sizes="76px"
            />
          )}
        </div>
      )}
    </main>
  );
}
