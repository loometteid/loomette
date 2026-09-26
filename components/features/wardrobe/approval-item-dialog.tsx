"use client";

import Image from "next/image";
import { toast } from "sonner";
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
import { Dialog, DialogPopup } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import { updateWardrobeItemMutationOptions } from "./mutation-options/update-wardrobe-item.mutation-option.client";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  OCCASION_OPTIONS,
  OUTFIT_SIZE_OPTIONS,
  getSubcategoryOptions,
  wardrobeItemFormSchema,
  type Gender,
  type Occasion,
  type OutfitSize,
  type PendingItem,
  type WardrobeItemFormValues,
} from "./types";

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

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogPopup>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="bg-secondary relative mx-auto aspect-square w-40 overflow-hidden rounded-xl">
            {item.item?.image_url && (
              <Image
                src={item.item.image_url}
                alt=""
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <input
              {...register("name")}
              placeholder="Name this piece"
              className="w-full bg-transparent text-center font-serif text-2xl outline-none placeholder:text-muted-foreground"
            />
            <input
              {...register("brand")}
              placeholder="Brand"
              className="text-muted-foreground w-full bg-transparent text-center text-xs tracking-wide uppercase outline-none placeholder:text-muted-foreground"
            />
          </div>

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

          <Accordion defaultValue={[]}>
            <AccordionItem value="details">
              <AccordionTrigger className="text-muted-foreground text-xs tracking-wide uppercase">
                Details
              </AccordionTrigger>
              <AccordionPanel className="flex flex-col gap-4 pt-2">
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
                    htmlFor="approval-price"
                    className="text-foreground text-xs tracking-wide uppercase"
                  >
                    Price
                  </Label>
                  <div className="relative">
                    <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-base">
                      Rp
                    </span>
                    <Input
                      id="approval-price"
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
                    htmlFor="approval-buy-from"
                    className="text-foreground text-xs tracking-wide uppercase"
                  >
                    Buy From
                  </Label>
                  <Input
                    id="approval-buy-from"
                    placeholder="e.g. Offline Store"
                    {...register("purchaseLocation")}
                  />
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending || isSubmitting}
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
