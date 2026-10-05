"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
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
      price: values.price.trim() && !Number.isNaN(parsedPrice) ? parsedPrice : null,
      purchaseLocation: values.purchaseLocation,
    });
  }

  const isSaving = updateMutation.isPending || isSubmitting;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogPopup
        className="max-w-md lg:max-w-2xl p-6 rounded-3xl bg-[#faf7f2] border-none shadow-2xl overflow-y-auto max-h-[90vh]"
        data-testid="approval-item-dialog"
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded-full bg-[#eae4dc] p-1.5 text-foreground hover:opacity-80 transition-opacity"
            data-testid="approval-item-dialog__close-button"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Responsive Split Container: single column on mobile, 2 columns on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Image & Taxonomy */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/60 relative mx-auto aspect-square w-48 overflow-hidden rounded-2xl border border-border/40 p-2 shadow-sm flex items-center justify-center">
                {item.item?.image_url && (
                  <Image
                    src={item.item.image_url}
                    alt=""
                    fill
                    className="object-contain p-2"
                  />
                )}
              </div>

              {/* Title & Brand on Mobile */}
              <div className="flex flex-col items-center gap-1 text-center lg:hidden">
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <input
                    {...register("name")}
                    placeholder="Name this piece"
                    className="bg-transparent text-center font-serif text-2xl outline-none placeholder:text-muted-foreground w-auto max-w-[220px]"
                  />
                  <Pencil className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-center gap-1 w-full">
                  <input
                    {...register("brand")}
                    placeholder="BRAND"
                    className="text-muted-foreground bg-transparent text-center text-xs tracking-wider uppercase outline-none placeholder:text-muted-foreground w-auto max-w-[150px]"
                  />
                  <Pencil className="size-3 text-muted-foreground" />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
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
                  <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
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
                  <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Outfit Size
                  </Label>
                  <Badge className="text-[0.65rem] uppercase tracking-wider">
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
                      onToggle={(value) => field.onChange(value as OutfitSize)}
                    />
                  )}
                />
              </div>
            </div>

            {/* Right Column (Desktop: Direct Fields / Mobile: Accordion for Details) */}
            <div className="flex flex-col gap-5">
              {/* Title & Brand on Desktop */}
              <div className="hidden lg:flex flex-col gap-1">
                <DialogTitle className="sr-only">Edit piece details</DialogTitle>
                <div className="flex items-center gap-2">
                  <input
                    {...register("name")}
                    placeholder="Name this piece"
                    className="bg-transparent font-serif text-2xl outline-none placeholder:text-muted-foreground w-full"
                  />
                  <Pencil className="size-4 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    {...register("brand")}
                    placeholder="BRAND"
                    className="text-muted-foreground bg-transparent text-xs tracking-wider uppercase outline-none placeholder:text-muted-foreground w-full"
                  />
                  <Pencil className="size-3 text-muted-foreground shrink-0" />
                </div>
              </div>

              {/* Desktop Details (Always Visible) */}
              <div className="hidden lg:flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Occasion
                  </Label>
                  <Controller
                    name="occasions"
                    control={control}
                    render={({ field }) => (
                      <PillToggleGroup
                        options={OCCASION_OPTIONS}
                        isSelected={(value) => field.value.includes(value as Occasion)}
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
                    htmlFor="desktop-approval-price"
                    className="text-muted-foreground text-xs font-medium tracking-wider uppercase"
                  >
                    Price
                  </Label>
                  <Input
                    id="desktop-approval-price"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. $100"
                    {...register("price")}
                    className="bg-[#eae4dc]/60 border-none rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="desktop-approval-buy-from"
                    className="text-muted-foreground text-xs font-medium tracking-wider uppercase"
                  >
                    Buy From
                  </Label>
                  <Input
                    id="desktop-approval-buy-from"
                    placeholder="e.g. Offline Store"
                    {...register("purchaseLocation")}
                    className="bg-[#eae4dc]/60 border-none rounded-xl"
                  />
                </div>
              </div>

              {/* Mobile Accordion for Details */}
              <div className="lg:hidden">
                <Accordion defaultValue={[]}>
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-muted-foreground text-xs tracking-wider uppercase">
                      Details
                    </AccordionTrigger>
                    <AccordionPanel className="flex flex-col gap-4 pt-2">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                          Occasion
                        </Label>
                        <Controller
                          name="occasions"
                          control={control}
                          render={({ field }) => (
                            <PillToggleGroup
                              options={OCCASION_OPTIONS}
                              isSelected={(value) => field.value.includes(value as Occasion)}
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
                          htmlFor="mobile-approval-price"
                          className="text-muted-foreground text-xs font-medium tracking-wider uppercase"
                        >
                          Price
                        </Label>
                        <Input
                          id="mobile-approval-price"
                          type="number"
                          inputMode="decimal"
                          placeholder="e.g. $100"
                          {...register("price")}
                          className="bg-[#eae4dc]/60 border-none rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor="mobile-approval-buy-from"
                          className="text-muted-foreground text-xs font-medium tracking-wider uppercase"
                        >
                          Buy From
                        </Label>
                        <Input
                          id="mobile-approval-buy-from"
                          placeholder="e.g. Offline Store"
                          {...register("purchaseLocation")}
                          className="bg-[#eae4dc]/60 border-none rounded-xl"
                        />
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Save Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#393735] hover:bg-[#2b2a27] text-white rounded-2xl px-10 py-3.5 text-xs font-semibold uppercase tracking-wider w-full lg:w-auto"
                  data-testid="approval-item-dialog__save-button"
                >
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
