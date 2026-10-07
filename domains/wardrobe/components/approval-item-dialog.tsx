"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronDown, Pencil, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import { cn } from "@/lib/utils";
import { updateWardrobeItemMutationOptions } from "../mutation-options/update-wardrobe-item.mutation-option.client";
import {
  CATEGORY_OPTIONS,
  OCCASION_OPTIONS,
  OUTFIT_SIZE_OPTIONS,
  getSubcategoryOptions,
  type Gender,
  type Occasion,
  type OutfitSize,
  type PendingItem,
} from "../types";
import {
  wardrobeItemFormSchema,
  type WardrobeItemFormValues,
} from "../schemas/wardrobe-item.schema";

export function ApprovalItemDialog({
  item,
  gender,
  onOpenChange,
  onSaved,
}: {
  item: PendingItem;
  gender: Gender | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const updateMutation = useMutation({
    ...updateWardrobeItemMutationOptions(),
    onSuccess: () => {
      toast.success("Saved item changes");
      onSaved();
    },
    onError: (err) => {
      toast.error("Couldn't save changes", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
  });

  function onSubmit(values: WardrobeItemFormValues) {
    if (!item.item) return;
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

  const isSaving = updateMutation.isPending || isSubmitting;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogPopup
        showClose={false}
        className="fixed inset-0 m-auto h-fit max-w-[340px] lg:max-w-[820px] w-[calc(100%-3rem)] max-h-[90vh] p-6 lg:p-10 rounded-[24px] bg-[#FAFAF7] border-none shadow-2xl overflow-y-auto"
        data-testid="approval-item-dialog"
      >
        <DialogTitle className="sr-only">Edit piece details</DialogTitle>

        {/* Close button (Figma 3.1.1 / D.3.1.1: rounded square in #F2EDE5) */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-5 right-5 lg:top-7 lg:right-7 size-10 lg:size-12 rounded-xl bg-[#F2EDE5] hover:bg-[#EAE4DC] flex items-center justify-center text-[#444440] transition-colors z-20"
          data-testid="approval-item-dialog__close-button"
        >
          <X className="size-4 lg:size-5" />
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          {/* Top Section: Garment Image & Title/Brand (Single responsive structure) */}
          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-8 mb-6 lg:mb-8 pr-12 lg:pr-16">
            <div className="relative size-36 lg:size-44 shrink-0 flex items-center justify-center">
              {item.item?.image_url && (
                <Image
                  src={item.item.image_url}
                  alt=""
                  fill
                  className="object-contain p-1 drop-shadow-sm"
                />
              )}
            </div>

            <div className="flex flex-col items-center lg:items-start gap-1 w-full mt-3 lg:mt-0">
              <div className="flex items-center justify-center lg:justify-start gap-2 w-full">
                <input
                  {...register("name")}
                  placeholder="Name this piece"
                  className="bg-transparent font-serif text-2xl lg:text-3xl text-[#444440] text-center lg:text-left outline-none placeholder:text-[#9E9A90] w-auto max-w-[280px] lg:max-w-md"
                />
                <Pencil className="size-4 text-[#444440] shrink-0" />
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5 w-full">
                <input
                  {...register("brand")}
                  placeholder="BRAND"
                  className="text-[#9E9A90] bg-transparent text-xs tracking-widest uppercase text-center lg:text-left outline-none placeholder:text-[#9E9A90] w-auto max-w-[180px] lg:max-w-xs"
                />
                <Pencil className="size-3 text-[#9E9A90] shrink-0" />
              </div>
            </div>
          </div>

          {/* Form Fields: Two Columns on Desktop (D.3.1.1) / Stack + Accordion on Mobile (3.1.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-start">
            {/* Left Column (Desktop) / Primary Fields (Mobile) */}
            <div className="flex flex-col gap-4 lg:gap-5">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase font-medium tracking-wider text-[#444440]">
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

              {/* Sub Category */}
              {subcategoryOptions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase font-medium tracking-wider text-[#444440]">
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
                  <Label className="text-xs uppercase font-medium tracking-wider text-[#444440]">
                    Outfit Size
                  </Label>
                  <span className="bg-[#F2EDE5] text-[#78746D] px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-normal">
                    Optional
                  </span>
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
            </div>

            {/* Right Column (Desktop: Always Visible) / Collapsible Details (Mobile: 3.1.1) */}
            <div className="flex flex-col gap-4 lg:gap-5">
              {/* Mobile Details Toggle */}
              <button
                type="button"
                onClick={() => setDetailsOpen((prev) => !prev)}
                className="flex lg:hidden w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-[#444440] py-2 cursor-pointer border-t border-[#EAE4DC]/60 pt-3"
              >
                <span>Details</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-[#444440] transition-transform duration-200",
                    detailsOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Details Content Container (Hidden on mobile if not open, always flex on desktop) */}
              <div
                className={cn(
                  "flex flex-col gap-4 lg:gap-5",
                  !detailsOpen && "hidden lg:flex",
                )}
              >
                {/* Occasion */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase font-medium tracking-wider text-[#444440]">
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
                    htmlFor="approval-price"
                    className="text-xs uppercase font-medium tracking-wider text-[#444440]"
                  >
                    Price
                  </Label>
                  <Input
                    id="approval-price"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. $100"
                    {...register("price")}
                    className="bg-[#F2EDE5] border-none rounded-2xl h-12 px-4 text-sm text-[#444440] placeholder:text-[#9E9A90] focus-visible:ring-1 focus-visible:ring-[#444440]"
                  />
                </div>

                {/* Buy From */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="approval-buy-from"
                    className="text-xs uppercase font-medium tracking-wider text-[#444440]"
                  >
                    Buy From
                  </Label>
                  <Input
                    id="approval-buy-from"
                    placeholder="e.g. Offline Store"
                    {...register("purchaseLocation")}
                    className="bg-[#F2EDE5] border-none rounded-2xl h-12 px-4 text-sm text-[#444440] placeholder:text-[#9E9A90] focus-visible:ring-1 focus-visible:ring-[#444440]"
                  />
                </div>
              </div>

              {/* Desktop Save Button (Aligned bottom right per D.3.1.1) */}
              <div className="hidden lg:flex justify-end mt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#444440] hover:bg-[#333330] text-white px-12 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
                  data-testid="approval-item-dialog__save-button"
                >
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Save Button (Full width at bottom per 3.1.1) */}
          <div className="lg:hidden mt-4 pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#444440] hover:bg-[#333330] text-white py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
              data-testid="approval-item-dialog__save-button"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
