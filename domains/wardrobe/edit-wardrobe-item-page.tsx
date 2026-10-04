"use client";

import { useState } from "react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { getWardrobeItemByIdQueryOptionsForBrowser } from "./query-options/get-wardrobe-item-by-id.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-wardrobe-items.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "./query-options/get-pending-count.query-option.client";
import { getUserGenderQueryOptionsForBrowser } from "./query-options/get-user-gender.query-option.client";
import { updateWardrobeItemMutationOptions } from "./mutation-options/update-wardrobe-item.mutation-option.client";
import { discardWardrobeItemsMutationOptions } from "./mutation-options/discard-wardrobe-items.mutation-option.client";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
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

// "Last Pairing" / "Might be a perfect match" from the Figma reference
// are omitted — they need an outfit-matching engine that doesn't exist
// yet (no Gemini, no recommendation logic). This screen only covers
// editing the item's own metadata and deleting it.
export function EditItemForm({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  const { data: item } = useSuspenseQuery(
    getWardrobeItemByIdQueryOptionsForBrowser(userId, id),
  );
  const { data: gender } = useSuspenseQuery(
    getUserGenderQueryOptionsForBrowser(userId),
  );

  if (!item) {
    notFound();
  }

  const [showOriginal, setShowOriginal] = useState(false);

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
  const displayedImage = showOriginal ? item.image_url : item.item?.image_url;

  const updateMutation = useMutation({
    ...updateWardrobeItemMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemByIdQueryOptionsForBrowser(userId, id).queryKey,
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
        queryKey: getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
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
      price: values.price.trim() && !Number.isNaN(parsedPrice) ? parsedPrice : null,
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav username={profile?.username} />

      <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col gap-6 lg:gap-10 px-6 lg:px-12 py-8 pb-32">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl"
            onClick={() => router.back()}
            aria-label="Go back"
            disabled={isBusy}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isBusy}
            aria-label="Delete item"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Column: Image, Title, Brand, Photo Toggle */}
            <div className="flex flex-col items-center gap-6">
              <div className="bg-secondary relative aspect-square w-52 lg:w-80 overflow-hidden rounded-2xl shadow-sm">
                {displayedImage && (
                  <Image
                    src={displayedImage}
                    alt={item.item?.name ?? "Garment"}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {item.image_url && item.item?.image_url && (
                <button
                  type="button"
                  onClick={() => setShowOriginal((prev) => !prev)}
                  className="border-border rounded-full border px-5 py-2 text-xs font-medium tracking-wide uppercase transition-colors hover:bg-secondary"
                >
                  {showOriginal ? "See Processed Photo" : "See Original Photo"}
                </button>
              )}

              <div className="flex flex-col items-center gap-2 text-center w-full max-w-xs">
                <div className="relative flex items-center justify-center w-full">
                  <input
                    {...register("name")}
                    placeholder="Name this piece"
                    className="w-full bg-transparent text-center font-serif text-2xl lg:text-3xl outline-none placeholder:text-muted-foreground pr-6"
                  />
                  <Pencil className="size-3.5 text-muted-foreground pointer-events-none absolute right-2" />
                </div>
                <div className="relative flex items-center justify-center w-full">
                  <input
                    {...register("brand")}
                    placeholder="Brand"
                    className="text-muted-foreground w-full bg-transparent text-center text-xs tracking-wide uppercase outline-none placeholder:text-muted-foreground pr-6"
                  />
                  <Pencil className="size-3 text-muted-foreground pointer-events-none absolute right-2" />
                </div>
              </div>
            </div>

            {/* Right Column: Taxonomy, Size, Occasion, Price, Location, Save */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs tracking-wide uppercase">
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

              {subcategoryOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs tracking-wide uppercase">
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

              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                  Color
                </Label>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-label={option.label}
                          onClick={() => field.onChange(option.value)}
                          style={{ backgroundColor: option.swatch }}
                          className={cn(
                            "size-8 rounded-full border-2 transition-colors",
                            field.value === option.value
                              ? "border-foreground"
                              : "border-border",
                          )}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                    Outfit Size
                  </Label>
                  <Badge>Optional</Badge>
                </div>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <PillToggleGroup
                      options={OUTFIT_SIZE_OPTIONS}
                      isSelected={(value) => field.value === value}
                      onToggle={(value) => field.onChange(value as OutfitSize)}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs tracking-wide uppercase">
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

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="edit-item-price"
                  className="text-foreground text-xs tracking-wide uppercase"
                >
                  Price
                </Label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-base">
                    Rp
                  </span>
                  <Input
                    id="edit-item-price"
                    type="number"
                    inputMode="decimal"
                    placeholder="150.000"
                    {...register("price")}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="edit-item-buy-from"
                  className="text-foreground text-xs tracking-wide uppercase"
                >
                  Buy From
                </Label>
                <Input
                  id="edit-item-buy-from"
                  placeholder="e.g. Offline Store"
                  {...register("purchaseLocation")}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#393735] text-white hover:bg-[#2b2a27] rounded-xl py-3 font-semibold tracking-wider uppercase text-xs"
                disabled={isBusy || isSubmitting}
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
