"use client";

import { useMemo, useRef, useState } from "react";
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
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { generateOutfitName } from "@/lib/outfitNames";
import { CATEGORY_OPTIONS } from "@/components/features/wardrobe/types";
import {
  DEFAULT_SLOT_POSITIONS,
  ITEM_SIZE_RATIO,
} from "@/components/features/outfit/outfit-composition";
import type { CanvasItem, WardrobeOption } from "./types";

const DRAG_THRESHOLD_PX = 6;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

type GhostDrag = {
  option: WardrobeOption;
  clientX: number;
  clientY: number;
  dragging: boolean;
};

export function MixAndMatchCanvas({
  userId,
  wardrobeOptions,
}: {
  userId: string;
  wardrobeOptions: WardrobeOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // When arrived at from a Trip day's "Plan Outfit" button (see
  // trip-detail-view.tsx), Save should attach the outfit to that day
  // and return to the trip instead of going through the normal Result
  // page -- the day is already known, so there's nothing left to
  // confirm. The canvas/save mechanics themselves are unchanged either
  // way, only the post-save destination branches.
  const tripId = searchParams.get("tripId");
  const tripDay = searchParams.get("day");
  const returnTo = searchParams.get("returnTo");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(
    CATEGORY_OPTIONS[0].value,
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = wardrobeOptions.find(
      (option) => option.category === CATEGORY_OPTIONS[0].value,
    )?.subcategory;
    return first ? new Set([first]) : new Set();
  });
  const [ghost, setGhost] = useState<GhostDrag | null>(null);
  const [saving, setSaving] = useState(false);

  const dragRef = useRef<{
    wardrobeItemId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const categoriesGrouped = useMemo(() => {
    const bySubcategory = new Map<string, WardrobeOption[]>();
    for (const option of wardrobeOptions) {
      if (option.category !== activeCategory) continue;
      const list = bySubcategory.get(option.subcategory) ?? [];
      list.push(option);
      bySubcategory.set(option.subcategory, list);
    }
    return bySubcategory;
  }, [wardrobeOptions, activeCategory]);

  function addItemToCanvas(option: WardrobeOption, x: number, y: number) {
    setCanvasItems((prev) => {
      const nextLayer =
        prev.length === 0
          ? 0
          : Math.max(...prev.map((i) => i.layerOrder)) + 1;
      const withoutExisting = prev.filter(
        (i) => i.wardrobeItemId !== option.wardrobeItemId,
      );
      return [
        ...withoutExisting,
        {
          wardrobeItemId: option.wardrobeItemId,
          itemId: option.itemId,
          name: option.name,
          image_url: option.image_url,
          x: clamp01(x),
          y: clamp01(y),
          layerOrder: nextLayer,
        },
      ];
    });
    setSelectedId(option.wardrobeItemId);
  }

  // --- Reposition an item already on the canvas ---
  function handleItemPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    item: CanvasItem,
  ) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(item.wardrobeItemId);
    dragRef.current = {
      wardrobeItemId: item.wardrobeItemId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: item.x,
      startY: item.y,
    };
  }

  function handleItemPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = (event.clientX - drag.startClientX) / rect.width;
    const dy = (event.clientY - drag.startClientY) / rect.height;
    setCanvasItems((prev) =>
      prev.map((item) =>
        item.wardrobeItemId === drag.wardrobeItemId
          ? {
            ...item,
            x: clamp01(drag.startX + dx),
            y: clamp01(drag.startY + dy),
          }
          : item,
      ),
    );
  }

  function handleItemPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  // --- Drag a wardrobe item from the picker onto the canvas ---
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
    // Read from the render closure (fresh as of the last pointermove's
    // state update) rather than deciding what to do inside a setGhost
    // updater -- updaters can run more than once and shouldn't trigger
    // other components' setState as a side effect.
    const current = ghost;
    setGhost(null);
    if (!current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!current.dragging) {
      const slot = DEFAULT_SLOT_POSITIONS[current.option.category] ?? {
        x: 0.5,
        y: 0.5,
      };
      addItemToCanvas(current.option, slot.x, slot.y);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const insideCanvas =
      current.clientX >= rect.left &&
      current.clientX <= rect.right &&
      current.clientY >= rect.top &&
      current.clientY <= rect.bottom;

    if (insideCanvas) {
      const x = (current.clientX - rect.left) / rect.width;
      const y = (current.clientY - rect.top) / rect.height;
      addItemToCanvas(current.option, x, y);
    }
  }

  function handleDeleteSelected() {
    if (!selectedId) return;
    setCanvasItems((prev) => prev.filter((i) => i.wardrobeItemId !== selectedId));
    setSelectedId(null);
  }

  function moveLayer(direction: "up" | "down") {
    if (!selectedId) return;
    setCanvasItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.layerOrder - b.layerOrder);
      const idx = sorted.findIndex((i) => i.wardrobeItemId === selectedId);
      const swapIdx = direction === "up" ? idx + 1 : idx - 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      const aLayer = a.layerOrder;
      const bLayer = b.layerOrder;
      return prev.map((item) => {
        if (item.wardrobeItemId === a.wardrobeItemId)
          return { ...item, layerOrder: bLayer };
        if (item.wardrobeItemId === b.wardrobeItemId)
          return { ...item, layerOrder: aLayer };
        return item;
      });
    });
  }

  function handleShuffle() {
    const slotCategories = ["Tops", "Bottoms", "Shoes"] as const;
    const next: CanvasItem[] = [];
    let layer = 0;
    for (const category of slotCategories) {
      const options = wardrobeOptions.filter((o) => o.category === category);
      if (options.length === 0) continue;
      const choice = options[Math.floor(Math.random() * options.length)];
      const slot = DEFAULT_SLOT_POSITIONS[category];
      next.push({
        wardrobeItemId: choice.wardrobeItemId,
        itemId: choice.itemId,
        name: choice.name,
        image_url: choice.image_url,
        x: clamp01(slot.x + (Math.random() - 0.5) * 0.08),
        y: clamp01(slot.y + (Math.random() - 0.5) * 0.06),
        layerOrder: layer++,
      });
    }
    if (next.length === 0) {
      toast.error("Add some wardrobe items first.");
      return;
    }
    setCanvasItems(next);
    setSelectedId(null);
  }

  async function handleSave() {
    if (canvasItems.length === 0) {
      toast.error("Add at least one item to your canvas first.");
      return;
    }
    setSaving(true);
    const supabase = createBrowserSupabaseClient();


    // outfit_item (inserted below) is the source of truth for every
    // full-composition render (Result page, Calendar's grid thumbnail
    // and entry dialog) -- see components/features/outfit/outfit-
    // composition.tsx. cover_image_url is NOT used for any of those;
    // it only exists as a lightweight single-image summary for
    // contexts that intentionally don't want a full composition (e.g.
    // Profile's small Favorite grid cards), so the topmost (highest
    // layer_order) item stands in as a representative single image.
    const topItem = [...canvasItems].sort(
      (a, b) => b.layerOrder - a.layerOrder,
    )[0];

    const { data: outfitRow, error: outfitError } = await supabase
      .from("outfit")
      .insert({
        user_id: userId,
        name: generateOutfitName(),
        is_saved: false,
        cover_image_url: topItem?.image_url ?? null,
      })
      .select("id")
      .single();

    if (outfitError || !outfitRow) {
      toast.error("Couldn't save that outfit.");
      setSaving(false);
      return;
    }

    const { error: itemsError } = await supabase.from("outfit_item").insert(
      canvasItems.map((item) => ({
        outfit_id: outfitRow.id,
        wardrobe_item_id: item.wardrobeItemId,
        layer_order: item.layerOrder,
        position_x: item.x,
        position_y: item.y,
      })),
    );

    if (itemsError) {
      toast.error("Couldn't save that outfit.");
      setSaving(false);
      return;
    }

    if (tripId && tripDay) {
      const { error: wearLogError } = await supabase.from("wear_log").insert({
        user_id: userId,
        outfit_id: outfitRow.id,
        worn_on: tripDay,
      });
      if (wearLogError) {
        toast.error("Couldn't add that outfit to your trip.");
        setSaving(false);
        return;
      }
      toast.success("Outfit added to your trip.");
      router.push(returnTo ?? `/trip/${tripId}`);
      return;
    }

    router.push(`/mix-and-match/result/${outfitRow.id}`);
  }

  const sortedCanvasItems = [...canvasItems].sort(
    (a, b) => a.layerOrder - b.layerOrder,
  );

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-6 py-8">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle className="text-foreground size-5" />
          <Typography variant="title" as="h1">
            Mix &amp; Match
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!selectedId}
            aria-label="Delete selected item"
            className="bg-secondary flex size-10 items-center justify-center rounded-xl disabled:opacity-40"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            aria-label="Shuffle outfit"
            className="bg-secondary flex size-10 items-center justify-center rounded-xl"
          >
            <Shuffle className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={canvasRef}
          onPointerDown={() => setSelectedId(null)}
          className="border-border relative aspect-5/6 w-full touch-none overflow-hidden rounded-2xl border"
        >
          {sortedCanvasItems.map((item) => (
            <div
              key={item.wardrobeItemId}
              onPointerDown={(event) => handleItemPointerDown(event, item)}
              onPointerMove={handleItemPointerMove}
              onPointerUp={handleItemPointerUp}
              style={{
                left: `${item.x * 100}%`,
                top: `${item.y * 100}%`,
                zIndex: item.layerOrder,
                width: `${ITEM_SIZE_RATIO * 100}%`,
              }}
              className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 touch-none"
            >
              {item.wardrobeItemId === selectedId && (
                <div className="border-foreground pointer-events-none absolute -inset-1 border">
                  {[
                    "-top-1 -left-1",
                    "-top-1 -right-1",
                    "-bottom-1 -left-1",
                    "-bottom-1 -right-1",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={cn("bg-foreground absolute size-2", pos)}
                    />
                  ))}
                </div>
              )}
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name ?? ""}
                  fill
                  className="pointer-events-none object-contain"
                  sizes="140px"
                />
              )}
            </div>
          ))}

          {canvasItems.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center">
              <Typography variant="subtitle">
                Tap or drag wardrobe items here to start your look.
              </Typography>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            type="button"
            onClick={() => moveLayer("up")}
            disabled={!selectedId}
            aria-label="Bring forward"
            className="bg-secondary flex size-9 items-center justify-center rounded-lg shadow disabled:opacity-40"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => moveLayer("down")}
            disabled={!selectedId}
            aria-label="Send backward"
            className="bg-secondary flex size-9 items-center justify-center rounded-lg shadow disabled:opacity-40"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background absolute right-3 bottom-3 rounded-full px-6 py-2.5 text-sm font-medium tracking-wide uppercase shadow-lg disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => setActiveCategory(category.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium tracking-wide uppercase transition-colors",
              activeCategory === category.value
                ? "border-foreground text-foreground border-2"
                : "border-border text-muted-foreground",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {[...categoriesGrouped.entries()].map(([subcategory, options]) => {
          const isExpanded = expanded.has(subcategory);
          return (
            <div key={subcategory} className="border-border border-b py-4">
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
                className="flex w-full items-center justify-between"
              >
                <span className="text-xs font-medium tracking-wide uppercase">
                  {subcategory}
                </span>
                {isExpanded ? (
                  <ChevronUp className="text-muted-foreground size-4" />
                ) : (
                  <ChevronDown className="text-muted-foreground size-4" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-3 flex gap-3 overflow-x-auto">
                  {options.map((option) => (
                    <button
                      key={option.wardrobeItemId}
                      type="button"
                      onPointerDown={(event) =>
                        handlePickerPointerDown(event, option)
                      }
                      onPointerMove={handlePickerPointerMove}
                      onPointerUp={handlePickerPointerUp}
                      className="bg-secondary relative aspect-square w-20 shrink-0 touch-none overflow-hidden rounded-xl"
                    >
                      {option.image_url && (
                        <Image
                          src={option.image_url}
                          alt={option.name ?? ""}
                          fill
                          className="pointer-events-none object-contain p-1"
                          sizes="80px"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {categoriesGrouped.size === 0 && (
          <Typography variant="subtitle" className="py-6 text-center">
            No {activeCategory.toLowerCase()} in your wardrobe yet.
          </Typography>
        )}
      </div>

      {ghost && ghost.dragging && (
        <div
          style={{ left: ghost.clientX, top: ghost.clientY, width: 72, height: 72 }}
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-80"
        >
          {ghost.option.image_url && (
            <Image
              src={ghost.option.image_url}
              alt=""
              fill
              className="object-contain"
              sizes="72px"
            />
          )}
        </div>
      )}
    </main>
  );
}
