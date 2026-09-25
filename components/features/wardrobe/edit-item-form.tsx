"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { deleteWardrobeImages, pathFromPublicUrl } from "@/lib/wardrobeStorage";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  OCCASION_OPTIONS,
  OUTFIT_SIZE_OPTIONS,
  getSubcategoryOptions,
  type Gender,
  type Occasion,
  type OutfitSize,
  type PendingItem,
} from "./types";

// "Last Pairing" / "Might be a perfect match" from the Figma reference
// are omitted — they need an outfit-matching engine that doesn't exist
// yet (no Gemini, no recommendation logic). This screen only covers
// editing the item's own metadata and deleting it.
export function EditItemForm({
  item,
  gender,
}: {
  item: PendingItem;
  gender: Gender | null;
}) {
  const router = useRouter();
  const [showOriginal, setShowOriginal] = useState(false);
  const [name, setName] = useState(item.item?.name ?? "");
  const [brand, setBrand] = useState(item.item?.brand ?? "");
  const [category, setCategory] = useState<string | null>(
    item.item?.category ?? null,
  );
  const [subcategory, setSubcategory] = useState<string | null>(
    item.item?.subcategory ?? null,
  );
  const [color, setColor] = useState<string | null>(item.item?.color ?? null);
  const [size, setSize] = useState<OutfitSize | null>(item.size);
  const [occasions, setOccasions] = useState<Occasion[]>(item.occasions ?? []);
  const [price, setPrice] = useState(item.price?.toString() ?? "");
  const [purchaseLocation, setPurchaseLocation] = useState(
    item.purchase_location ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const subcategoryOptions = getSubcategoryOptions(category, gender);
  const displayedImage = showOriginal ? item.image_url : item.item?.image_url;

  async function handleSave() {
    if (!item.item) return;
    setSaving(true);
    const supabase = createBrowserSupabaseClient();


    const { error: itemError } = await supabase
      .from("item")
      .update({
        name: name.trim() || null,
        brand: brand.trim() || null,
        category,
        subcategory,
        color,
      })
      .eq("item_id", item.item.item_id);

    const parsedPrice = Number(price);
    const { error: wardrobeError } = await supabase
      .from("wardrobe_item")
      .update({
        size,
        occasions,
        price: price.trim() && !Number.isNaN(parsedPrice) ? parsedPrice : null,
        purchase_location: purchaseLocation.trim() || null,
      })
      .eq("id", item.id);

    setSaving(false);
    if (itemError || wardrobeError) {
      toast.error("Couldn't save changes", {
        description: itemError?.message ?? wardrobeError?.message,
      });
      return;
    }
    toast.success("Saved");
    router.push("/wardrobe");
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.rpc("discard_wardrobe_item", {
      p_wardrobe_item_id: item.id,
    });

    if (error) {
      setDeleting(false);
      toast.error("Couldn't delete item", { description: error.message });
      return;
    }

    deleteWardrobeImages(
      [
        pathFromPublicUrl(item.image_url),
        pathFromPublicUrl(item.item?.image_url),
      ].filter((p): p is string => !!p),
    ).catch(() => { });

    toast.success("Item deleted");
    router.push("/wardrobe");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8 pb-32">
      <div className="flex items-center justify-between">
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
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete item"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="bg-secondary relative mx-auto aspect-square w-52 overflow-hidden rounded-xl">
        {displayedImage && (
          <Image src={displayedImage} alt="" fill className="object-cover" />
        )}
      </div>

      {item.image_url !== item.item?.image_url && (
        <button
          type="button"
          onClick={() => setShowOriginal((prev) => !prev)}
          className="border-border mx-auto rounded-full border px-4 py-2 text-xs font-medium tracking-wide uppercase"
        >
          {showOriginal ? "See Processed Photo" : "See Original Photo"}
        </button>
      )}

      <div className="flex flex-col items-center gap-1 text-center">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name this piece"
          className="w-full bg-transparent text-center font-serif text-2xl outline-none placeholder:text-muted-foreground"
        />
        <input
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          placeholder="Brand"
          className="text-muted-foreground w-full bg-transparent text-center text-xs tracking-wide uppercase outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Category
        </Label>
        <PillToggleGroup
          options={CATEGORY_OPTIONS}
          isSelected={(value) => category === value}
          onToggle={(value) => {
            setCategory(value);
            setSubcategory(null);
          }}
        />
      </div>

      {subcategoryOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-xs tracking-wide uppercase">
            Sub Category
          </Label>
          <PillToggleGroup
            options={subcategoryOptions}
            isSelected={(value) => subcategory === value}
            onToggle={(value) => setSubcategory(value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Color
        </Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.label}
              onClick={() => setColor(option.value)}
              style={{ backgroundColor: option.swatch }}
              className={cn(
                "size-8 rounded-full border-2 transition-colors",
                color === option.value ? "border-foreground" : "border-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs tracking-wide uppercase">
            Outfit Size
          </Label>
          <Badge>Optional</Badge>
        </div>
        <PillToggleGroup
          options={OUTFIT_SIZE_OPTIONS}
          isSelected={(value) => size === value}
          onToggle={(value) => setSize(value as OutfitSize)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Occasion
        </Label>
        <PillToggleGroup
          options={OCCASION_OPTIONS}
          isSelected={(value) => occasions.includes(value as Occasion)}
          onToggle={(value) =>
            setOccasions((prev) =>
              prev.includes(value as Occasion)
                ? prev.filter((o) => o !== value)
                : [...prev, value as Occasion],
            )
          }
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
            value={price}
            onChange={(event) => setPrice(event.target.value)}
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
          value={purchaseLocation}
          onChange={(event) => setPurchaseLocation(event.target.value)}
        />
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </main>
  );
}
