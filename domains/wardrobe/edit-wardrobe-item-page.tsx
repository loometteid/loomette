"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import { Sparkle } from "@/components/ui/sparkle";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { getWardrobeItemByIdQueryOptionsForBrowser } from "./query-options/get-wardrobe-item-by-id.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-wardrobe-items.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "./query-options/get-pending-count.query-option.client";
import { getUserGenderQueryOptionsForBrowser } from "./query-options/get-user-gender.query-option.client";
import { getWardrobeItemLastPairingQueryOptionsForBrowser } from "./query-options/get-wardrobe-item-last-pairing.query-option.client";
import { updateWardrobeItemMutationOptions } from "./mutation-options/update-wardrobe-item.mutation-option.client";
import { discardWardrobeItemsMutationOptions } from "./mutation-options/discard-wardrobe-items.mutation-option.client";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import {
  CATEGORY_OPTIONS,
  OCCASION_OPTIONS,
  OUTFIT_SIZE_OPTIONS,
  getSubcategoryOptions,
  type Occasion,
  type OutfitSize,
} from "./types";
import {
  wardrobeItemFormSchema,
  type WardrobeItemFormValues,
} from "./schemas/wardrobe-item.schema";

export function EditItemForm({ userId, id }: { userId: string; id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  const { data: item } = useSuspenseQuery(
    getWardrobeItemByIdQueryOptionsForBrowser(userId, id),
  );
  const { data: gender } = useSuspenseQuery(
    getUserGenderQueryOptionsForBrowser(userId),
  );
  const { data: allItems = [] } = useQuery(
    getWardrobeItemsQueryOptionsForBrowser(userId),
  );
  const { data: lastPairing } = useQuery(
    getWardrobeItemLastPairingQueryOptionsForBrowser(id),
  );

  if (!item) {
    notFound();
  }

  const [sourcePreviewOpen, setSourcePreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<WardrobeItemFormValues>({
    resolver: zodResolver(wardrobeItemFormSchema),
    defaultValues: {
      name: item.item?.name ?? "",
      brand: item.item?.brand ?? "",
      category: item.item?.category ?? null,
      subcategory: item.item?.subcategory ?? null,
      color: item.item?.color ?? null,
      size: item.size,
      occasions: item.occasions ?? [],
      price: item.price?.toString() ?? "",
      purchaseLocation: item.purchase_location ?? "",
    },
  });

  const category = useWatch({
    control,
    name: "category",
  });
  const subcategoryOptions = getSubcategoryOptions(category ?? null, gender);
  const displayedImage = item.item?.image_url ?? item.image_url;

  const updateMutation = useMutation({
    ...updateWardrobeItemMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemByIdQueryOptionsForBrowser(userId, id)
          .queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      toast.success("Saved");
      router.push("/wardrobe");
    },
    onError: (err) => {
      toast.error("Couldn't save changes", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    ...discardWardrobeItemsMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey:
          getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      toast.success("Item deleted");
      router.push("/wardrobe");
    },
    onError: (err) => {
      toast.error("Couldn't delete item", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
  });

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  function onSubmit(values: WardrobeItemFormValues) {
    if (!item?.item) return;
    const parsedPrice = Number(values.price);
    updateMutation.mutate({
      wardrobeItemId: item.id,
      itemId: item.item.item_id,
      name: values.name,
      brand: values.brand,
      category: values.category ?? null,
      subcategory: values.subcategory ?? null,
      color: values.color ?? null,
      size: values.size ?? null,
      occasions: values.occasions,
      price:
        values.price.trim() && !Number.isNaN(parsedPrice) ? parsedPrice : null,
      purchaseLocation: values.purchaseLocation,
    });
  }

  function handleDelete() {
    if (!item) return;
    deleteMutation.mutate({
      items: [
        {
          id: item.id,
          imageUrls: [item.image_url, item.item?.image_url],
        },
      ],
    });
  }

  // Complementary recommendations for "Might be a perfect match"
  const perfectMatches = useMemo(() => {
    const otherItems = allItems.filter((row) => row.id !== id);
    // Prioritize items from different categories to form complete looks
    const sorted = [...otherItems].sort((a, b) => {
      const aSameCat = a.item?.category === category ? 1 : 0;
      const bSameCat = b.item?.category === category ? 1 : 0;
      return aSameCat - bSameCat;
    });
    return sorted.slice(0, 4);
  }, [allItems, id, category]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav userId={userId} />

      <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col px-6 lg:px-12 py-6 lg:py-10 pb-36">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            disabled={isBusy}
            className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-foreground flex size-10 items-center justify-center rounded-xl transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isBusy || isSubmitting}
              className="bg-[#393735] hover:bg-[#2b2a27] text-white rounded-xl px-5 py-2 text-xs font-semibold uppercase tracking-wider shadow-sm transition-transform active:scale-95"
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>

            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isBusy}
              aria-label="Delete item"
              className="bg-[#F2EDE5] hover:bg-destructive/10 text-destructive flex size-10 items-center justify-center rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Left Column: Garment Showcase, Title, Brand, Photo Toggle */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Floating Cutout Image */}
              <div className="relative flex flex-col items-center justify-center w-full max-w-[280px] lg:max-w-sm aspect-square my-2">
                <div className="relative h-full w-full flex items-center justify-center">
                  {displayedImage && (
                    <Image
                      src={displayedImage}
                      alt={item.item?.name ?? "Garment"}
                      fill
                      sizes="(min-width: 1024px) 384px, 280px"
                      className="object-contain drop-shadow-md transition-transform duration-200"
                    />
                  )}
                </div>
                <div className="h-2.5 w-32 lg:w-44 rounded-full bg-black/10 blur-[4px] mt-2" />
              </div>

              {/* Mobile "See Original Photo" button (directly below image in Figma 3.3) */}
              {item.image_url && (
                <button
                  type="button"
                  onClick={() => setSourcePreviewOpen(true)}
                  className="mt-3 mb-2 lg:hidden rounded-full border border-[#C9C3B7] bg-transparent px-6 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#444440] hover:bg-[#F2EDE5] transition-colors"
                >
                  See Original Photo
                </button>
              )}

              {/* Title & Brand with inline Pencil */}
              <div className="mt-2 lg:mt-6 flex flex-col items-center gap-1 text-center w-full">
                <div className="relative flex items-center justify-center w-full">
                  <input
                    {...register("name")}
                    placeholder="Name this piece"
                    className="w-full bg-transparent text-center font-serif text-3xl lg:text-4xl outline-none placeholder:text-muted-foreground font-medium text-[#444440]"
                  />
                  <Pencil className="size-4 text-foreground/50 pointer-events-none absolute right-4 lg:right-6" />
                </div>
                <div className="relative flex items-center justify-center w-full mt-0.5">
                  <input
                    {...register("brand")}
                    placeholder="BRAND"
                    className="text-[#8C887B] w-full bg-transparent text-center text-xs tracking-widest uppercase outline-none placeholder:text-[#8C887B] font-medium"
                  />
                  <Pencil className="size-3 text-[#8C887B] pointer-events-none absolute right-8 lg:right-12" />
                </div>
              </div>

              {/* Desktop "See Original Photo" button (below title & brand in Figma D.3.3) */}
              {item.image_url && (
                <button
                  type="button"
                  onClick={() => setSourcePreviewOpen(true)}
                  className="mt-6 hidden lg:inline-flex rounded-xl border border-[#C9C3B7] bg-transparent px-8 py-3 text-xs font-semibold uppercase tracking-wider text-[#444440] hover:bg-[#F2EDE5] transition-colors"
                >
                  See Original Photo
                </button>
              )}
            </div>

            {/* Right Column: Taxonomy, Size, Occasion, Price, Location, Last Pairing */}
            <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
              {/* Form Fields: Stacked on mobile, 2 sub-columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Column 1 on Desktop */}
                <div className="flex flex-col gap-6">
                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-[#8C887B] text-xs font-semibold tracking-widest uppercase">
                      Category
                    </Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <PillToggleGroup
                          options={CATEGORY_OPTIONS}
                          isSelected={(value) => field.value === value}
                          onToggle={(value) => {
                            field.onChange(value);
                            setValue("subcategory", null);
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Subcategory */}
                  {subcategoryOptions.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-[#8C887B] text-xs font-semibold tracking-widest uppercase">
                        Sub Category
                      </Label>
                      <Controller
                        name="subcategory"
                        control={control}
                        render={({ field }) => (
                          <PillToggleGroup
                            options={subcategoryOptions}
                            isSelected={(value) => field.value === value}
                            onToggle={(value) => field.onChange(value)}
                          />
                        )}
                      />
                    </div>
                  )}

                  {/* Outfit Size */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#8C887B] text-xs font-semibold tracking-widest uppercase">
                        Outfit Size
                      </Label>
                      <Badge className="bg-[#F2EDE5] text-[#8C887B] text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                        Optional
                      </Badge>
                    </div>
                    <Controller
                      name="size"
                      control={control}
                      render={({ field }) => (
                        <PillToggleGroup
                          options={OUTFIT_SIZE_OPTIONS}
                          isSelected={(value) => field.value === value}
                          onToggle={(value) =>
                            field.onChange(value as OutfitSize)
                          }
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Column 2 on Desktop */}
                <div className="flex flex-col gap-6">
                  {/* Occasion */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-[#8C887B] text-xs font-semibold tracking-widest uppercase">
                      Occasion
                    </Label>
                    <Controller
                      name="occasions"
                      control={control}
                      render={({ field }) => (
                        <PillToggleGroup
                          options={OCCASION_OPTIONS}
                          isSelected={(value) =>
                            field.value.includes(value as Occasion)
                          }
                          onToggle={(value) => {
                            const occ = value as Occasion;
                            const current = field.value;
                            const next = current.includes(occ)
                              ? current.filter((o) => o !== occ)
                              : [...current, occ];
                            field.onChange(next);
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Price */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="edit-item-price"
                      className="text-[#8C887B] text-xs font-semibold tracking-widest uppercase"
                    >
                      Price
                    </Label>
                    <Input
                      id="edit-item-price"
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. $100"
                      {...register("price")}
                      className="bg-[#F2EDE5] border-none rounded-xl text-foreground placeholder:text-[#8C887B] px-4 py-3 h-11"
                    />
                  </div>

                  {/* Buy From */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="edit-item-buy-from"
                      className="text-[#8C887B] text-xs font-semibold tracking-widest uppercase"
                    >
                      Buy From
                    </Label>
                    <Input
                      id="edit-item-buy-from"
                      placeholder="e.g. Offline Store, Shopee"
                      {...register("purchaseLocation")}
                      className="bg-[#F2EDE5] border-none rounded-xl text-foreground placeholder:text-[#8C887B] px-4 py-3 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* LAST PAIRING Section */}
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C887B] lg:text-foreground">
                  Last Pairing
                </span>
                <div className="flex gap-4 items-center">
                  {/* Card 1: Last outfit preview */}
                  <div className="border border-[#EAE4DC] bg-[#FAF8F5] rounded-2xl p-4 flex items-center justify-center relative aspect-3/4 w-44 lg:w-48 overflow-hidden shrink-0 shadow-sm">
                    {lastPairing?.items && lastPairing.items.length > 0 ? (
                      <OutfitComposition
                        items={lastPairing.items}
                        imageSizes="120px"
                        className="h-full w-full"
                      />
                    ) : lastPairing?.cover_image_url ? (
                      <Image
                        src={lastPairing.cover_image_url}
                        alt="Last outfit"
                        fill
                        className="object-contain"
                      />
                    ) : displayedImage ? (
                      <div className="relative h-full w-full flex items-center justify-center">
                        <Image
                          src={displayedImage}
                          alt="Piece preview"
                          fill
                          className="object-contain drop-shadow-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic text-center">
                        No previous pairings yet
                      </span>
                    )}
                  </div>

                  {/* Card 2: Mix & Match CTA */}
                  <Link
                    href={`/mix-and-match?itemId=${item.id}`}
                    prefetch
                    className="border border-[#EAE4DC] bg-[#FAF8F5] hover:bg-[#F2EDE5] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 aspect-3/4 w-44 lg:w-48 shrink-0 transition-colors shadow-sm group"
                  >
                    <div className="size-12 rounded-full border-2 border-dashed border-[#8C887B] flex items-center justify-center group-hover:border-foreground transition-colors">
                      <Plus className="size-5 text-[#8C887B] group-hover:text-foreground transition-colors" />
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#8C887B] text-center leading-tight group-hover:text-foreground transition-colors">
                      Mix &amp; Match
                      <br />
                      This Item
                    </span>
                  </Link>
                </div>

                {/* Pagination indicator pill line */}
                <div className="w-8 h-1 rounded-full bg-[#DED6CB] mt-1" />
              </div>
            </div>
          </div>
        </form>

        {/* MIGHT BE A PERFECT MATCH Section */}
        {perfectMatches.length > 0 && (
          <div className="mt-14 flex flex-col gap-4">
            <span className="text-xs lg:text-sm font-semibold uppercase tracking-widest text-[#8C887B] lg:text-foreground">
              Might Be A Perfect Match
            </span>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-6">
              {perfectMatches.map((matchItem, index) => (
                <Link
                  key={matchItem.id}
                  href={`/wardrobe/${matchItem.id}`}
                  prefetch
                  className="group border border-[#EAE4DC] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] rounded-2xl p-4 flex flex-col items-center justify-between text-center relative transition-all min-w-[150px] lg:min-w-0 shadow-sm hover:border-foreground/30"
                >
                  {index === 0 && (
                    <span className="absolute top-3 left-3 bg-[#F2EDE5] text-[#393735] text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs">
                      #1 Trending
                    </span>
                  )}

                  <div className="relative aspect-square w-full my-3 flex items-center justify-center">
                    {matchItem.item?.image_url && (
                      <Image
                        src={matchItem.item.image_url}
                        alt={matchItem.item.name ?? "Match piece"}
                        fill
                        sizes="(min-width: 1024px) 25vw, 150px"
                        className="object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="mt-2 flex flex-col items-center gap-0.5 w-full">
                    <span className="font-serif text-base text-foreground font-medium truncate w-full">
                      {matchItem.item?.name || "Untitled"}
                    </span>
                    <span className="text-[#8C887B] text-xs font-normal">
                      {matchItem.price
                        ? `Rp${matchItem.price.toLocaleString("id-ID")}`
                        : "Rp39.000"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky CTA Button (Figma 3.3) */}
        <div className="fixed bottom-6 left-6 right-6 z-30 lg:hidden">
          <Link
            href={`/mix-and-match?itemId=${item.id}`}
            prefetch
            className="w-full bg-[#393735] hover:bg-[#2b2a27] text-white flex items-center justify-center rounded-2xl py-4 font-semibold uppercase tracking-wider text-xs shadow-xl transition-transform active:scale-95"
          >
            Mix &amp; Match This Item
          </Link>
        </div>

        {/* Source Preview Modal (Figma 3.3 Ori Photo / D.3.3 Ori Photo) */}
        <Dialog open={sourcePreviewOpen} onOpenChange={setSourcePreviewOpen}>
          <DialogPopup
            showClose={false}
            className="fixed inset-0 m-auto h-fit max-w-[340px] lg:max-w-md w-[calc(100%-3rem)] p-6 lg:p-8 rounded-[24px] bg-[#FAFAF7] border-none text-center shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSourcePreviewOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 size-10 rounded-xl bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Sparkle className="size-5 text-[#444440]" />
                <DialogTitle className="font-serif text-2xl lg:text-3xl text-[#444440]">
                  Source Preview
                </DialogTitle>
              </div>

              <div className="relative aspect-square w-full max-w-[260px] rounded-2xl overflow-hidden bg-[#ECE7DF] my-2 flex items-center justify-center">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt="Original photo"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs text-[#78746D]">No photo available</span>
                )}
              </div>

              {item.purchase_location && (
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#78746D]">
                  {item.purchase_location}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSourcePreviewOpen(false)}
                className="w-full bg-[#444440] hover:bg-[#333330] text-white py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors mt-2"
              >
                Okay
              </button>
            </div>
          </DialogPopup>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmDialog
          open={deleteConfirmOpen}
          count={1}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      </main>
    </div>
  );
}
