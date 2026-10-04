"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardCheck, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SubcategoryCarousel } from "./components/subcategory-carousel";
import { WardrobeFilterDialog } from "./components/wardrobe-filter-dialog";
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
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { useOnboardingGuard } from "@/domains/onboarding/hooks/use-onboarding-guard";

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
  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  useOnboardingGuard(profile);

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
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<
    Record<string, string>
  >({});

  const query = search.trim().toLowerCase();
  const isFiltering = !!query || hasActiveFilters(filters);

  const results = useMemo(() => {
    return items.filter((row) => {
      if (query && !row.item?.name?.toLowerCase().includes(query)) return false;
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
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-col gap-6 lg:gap-10 px-6 lg:px-12 py-8 lg:py-10">
      <div className="flex items-center justify-center gap-2 lg:hidden">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Wardrobe
        </Typography>
      </div>

      <div className="mx-auto flex w-full max-w-2xl lg:max-w-3xl items-center gap-2 lg:gap-3">
        <div className="border-border bg-secondary flex flex-1 items-center gap-2 rounded-lg lg:rounded-xl border px-3 lg:px-4 py-2 lg:py-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Looking for your pairs?"
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm lg:text-base outline-none"
          />
          <Search className="text-muted-foreground size-4 lg:size-5 shrink-0" />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="border-border bg-secondary flex size-9 lg:size-11 shrink-0 items-center justify-center rounded-lg lg:rounded-xl border transition-colors hover:bg-secondary/80"
          aria-label="Filter"
        >
          <SlidersHorizontal className="size-4 lg:size-5" />
        </button>
        <Link
          href="/wardrobe/approval"
          prefetch
          className="border-border bg-secondary relative flex size-9 lg:size-11 shrink-0 items-center justify-center rounded-lg lg:rounded-xl border transition-colors hover:bg-secondary/80"
          aria-label="Approval queue"
        >
          <ClipboardCheck className="size-4 lg:size-5" />
          {!!pendingCount && (
            <span className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex size-4 lg:size-5 items-center justify-center rounded-full text-[0.6rem] lg:text-xs">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 content-start gap-4 lg:gap-6">
            {results.map((row) => (
              <Link
                key={row.id}
                href={`/wardrobe/${row.id}`}
                prefetch
                className="border-border flex flex-col gap-2 rounded-2xl border p-3 lg:p-4 text-left transition-all hover:border-foreground/40 hover:shadow-sm"
              >
                <div className="bg-secondary relative aspect-square w-full overflow-hidden rounded-xl">
                  {row.item?.image_url && (
                    <Image
                      src={row.item.image_url}
                      alt={row.item?.name ?? ""}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-base lg:text-lg">
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
              className="flex flex-col items-center gap-4 lg:gap-6 text-center"
            >
              <span className="text-foreground text-xs lg:text-sm font-medium tracking-wide uppercase">
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
                  "scrollbar-none flex gap-3 lg:gap-5",
                  activeItems.length > 2
                    ? "-mx-6 w-full overflow-x-auto lg:mx-0 lg:flex-wrap lg:justify-center"
                    : "w-full justify-center",
                )}
              >
                {activeItems.map((row) => (
                  <Link
                    key={row.id}
                    href={`/wardrobe/${row.id}`}
                    prefetch
                    className="bg-secondary relative aspect-square w-32 lg:w-40 shrink-0 overflow-hidden rounded-xl transition-transform hover:scale-105"
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

      {addMenuOpen && (
        <div
          data-testid="wardrobe__add-menu-backdrop"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setAddMenuOpen(false)}
        />
      )}

      <div className="fixed right-6 bottom-24 lg:right-10 lg:bottom-10 z-50 flex flex-col items-end gap-3">
        {addMenuOpen && (
          <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Link
              href="/wardrobe/add"
              prefetch
              data-testid="wardrobe__add-items-button"
              className="bg-[#393735] text-white hover:bg-[#2b2a27] px-5 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg transition-transform active:scale-95"
              onClick={() => setAddMenuOpen(false)}
            >
              Add Items
            </Link>
            <Link
              href="/mix-and-match"
              prefetch
              data-testid="wardrobe__mix-match-button"
              className="bg-[#393735] text-white hover:bg-[#2b2a27] px-5 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase shadow-lg transition-transform active:scale-95"
              onClick={() => setAddMenuOpen(false)}
            >
              Mix &amp; Match
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={() => setAddMenuOpen(!addMenuOpen)}
          aria-label={addMenuOpen ? "Close menu" : "Add item"}
          data-testid="wardrobe__add-button"
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl shadow-lg transition-colors",
            addMenuOpen
              ? "bg-card text-foreground border border-border"
              : "bg-foreground text-background",
          )}
        >
          {addMenuOpen ? <X className="size-6" /> : <Plus className="size-6" />}
        </button>
      </div>

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
