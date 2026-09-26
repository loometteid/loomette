"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardCheck, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SubcategoryCarousel } from "./subcategory-carousel";
import { WardrobeFilterDialog } from "./wardrobe-filter-dialog";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  matchesFilters,
  type WardrobeFilters,
  type WardrobeItem,
} from "./types";
import { getWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-wardrobe-items.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "./query-options/get-pending-count.query-option.client";
import { getUserGenderQueryOptionsForBrowser } from "./query-options/get-user-gender.query-option.client";

const CATEGORY_ORDER = ["Accessories", "Tops", "Bottoms", "Shoes"];
// Figma's subcategory selector always has something to show; items that
// were approved before ever having a subcategory set (or Gemini-filled
// later) land here instead of silently disappearing from the grid.
const FALLBACK_SUBCATEGORY = "Other";

type CategoryGroup = {
  category: string;
  subcategories: string[];
  itemsBySubcategory: Map<string, WardrobeItem[]>;
};

export function WardrobeView({ userId }: { userId: string }) {
  const { data: items } = useSuspenseQuery(
    getWardrobeItemsQueryOptionsForBrowser(userId),
  );
  const { data: pendingCount } = useSuspenseQuery(
    getPendingWardrobeCountQueryOptionsForBrowser(userId),
  );
  const { data: gender } = useSuspenseQuery(
    getUserGenderQueryOptionsForBrowser(userId),
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<WardrobeFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<
    Record<string, string>
  >({});

  const query = search.trim().toLowerCase();
  const isFiltering = !!query || hasActiveFilters(filters);

  const results = useMemo(() => {
    return items.filter((row) => {
      if (query && !row.item?.name?.toLowerCase().includes(query))
        return false;
      return matchesFilters(row, filters);
    });
  }, [items, query, filters]);

  const groups = useMemo<CategoryGroup[]>(() => {
    const byCategory = new Map<string, WardrobeItem[]>();
    for (const row of items) {
      const category = row.item?.category ?? "Uncategorized";
      byCategory.set(category, [...(byCategory.get(category) ?? []), row]);
    }

    const orderedCategories = [...byCategory.keys()].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return orderedCategories.map((category) => {
      const categoryItems = byCategory.get(category) ?? [];
      const itemsBySubcategory = new Map<string, WardrobeItem[]>();
      for (const row of categoryItems) {
        const subcategory = row.item?.subcategory ?? FALLBACK_SUBCATEGORY;
        itemsBySubcategory.set(subcategory, [
          ...(itemsBySubcategory.get(subcategory) ?? []),
          row,
        ]);
      }
      return {
        category,
        subcategories: [...itemsBySubcategory.keys()],
        itemsBySubcategory,
      };
    });
  }, [items]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-center gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Wardrobe
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <div className="border-border bg-secondary flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
          <Search className="text-muted-foreground size-4 shrink-0" />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="border-border bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg border"
          aria-label="Filter"
        >
          <SlidersHorizontal className="size-4" />
        </button>
        <Link
          href="/wardrobe/approval"
          className="border-border bg-secondary relative flex size-9 shrink-0 items-center justify-center rounded-lg border"
          aria-label="Approval queue"
        >
          <ClipboardCheck className="size-4" />
          {!!pendingCount && (
            <span className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[0.6rem]">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      {isFiltering ? (
        results.length === 0 ? (
          <Typography variant="subtitle" className="mt-16 text-center">
            Nothing matches.
          </Typography>
        ) : (
          <div className="grid grid-cols-2 content-start gap-4">
            {results.map((row) => (
              <Link
                key={row.id}
                href={`/wardrobe/${row.id}`}
                className="border-border flex flex-col gap-2 rounded-2xl border p-3 text-left"
              >
                <div className="bg-secondary relative aspect-square w-full overflow-hidden rounded-xl">
                  {row.item?.image_url && (
                    <Image
                      src={row.item.image_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-base">
                    {row.item?.name || "Untitled"}
                  </span>
                  {row.item?.brand && (
                    <span className="text-muted-foreground text-xs tracking-wide uppercase">
                      {row.item.brand}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Typography variant="subtitle">
            Nothing here yet. Add your first piece to get started.
          </Typography>
        </div>
      ) : (
        groups.map(({ category, subcategories, itemsBySubcategory }) => {
          const active =
            activeSubcategory[category] ??
            subcategories[0] ??
            FALLBACK_SUBCATEGORY;
          const activeItems = itemsBySubcategory.get(active) ?? [];

          return (
            <div
              key={category}
              className="flex flex-col items-center gap-4 text-center"
            >
              <span className="text-foreground text-xs font-medium tracking-wide uppercase">
                {category}
              </span>
              <SubcategoryCarousel
                options={subcategories}
                active={active}
                onChange={(value) =>
                  setActiveSubcategory((prev) => ({
                    ...prev,
                    [category]: value,
                  }))
                }
              />
              <div
                className={cn(
                  "scrollbar-none flex gap-3",
                  // At w-32 items + gap-3 inside this max-w-sm page, 2
                  // items fit without overflowing -- center those runs
                  // so they sit under the (centered) active subcategory
                  // instead of stranded at the left edge. 3+ items need
                  // to scroll, so they keep the Figma-matching edge-to-
                  // edge bleed instead (centering a genuinely-
                  // overflowing flex row makes part of it unreachable
                  // by scroll in some browsers).
                  activeItems.length > 2
                    ? "-mx-6 w-full overflow-x-auto"
                    : "w-full justify-center",
                )}
              >
                {activeItems.map((row) => (
                  <Link
                    key={row.id}
                    href={`/wardrobe/${row.id}`}
                    className="bg-secondary relative aspect-square w-32 shrink-0 overflow-hidden rounded-xl"
                  >
                    {row.item?.image_url && (
                      <Image
                        src={row.item.image_url}
                        alt={row.item.name ?? ""}
                        fill
                        className="object-cover"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}

      <Link
        href="/onboarding/7"
        aria-label="Add item"
        className="bg-foreground text-background fixed right-6 bottom-24 flex size-14 items-center justify-center rounded-2xl shadow-lg"
      >
        <Plus className="size-6" />
      </Link>

      <WardrobeFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={setFilters}
        gender={gender}
      />
    </main>
  );
}
