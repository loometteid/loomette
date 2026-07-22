"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/client";
import { deleteWardrobeImages, pathFromPublicUrl } from "@/lib/wardrobeStorage";
import { ApprovalItemDialog } from "./approval-item-dialog";
import type { Gender, PendingItem } from "./types";

// Checkboxes are a plain multi-select over the queue: Approve acts on
// whatever's checked (sets is_approved=true), the trash icon discards
// whatever's checked. Figma didn't fully spec the trash icon's exact
// semantics (bulk-clear vs. selection-based) — this is the more
// standard inbox-style pattern and symmetric with Approve.
export function ApprovalQueue({
  items,
  gender,
}: {
  items: PendingItem[];
  gender: Gender | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApprove() {
    if (selected.size === 0) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("wardrobe_item")
      .update({ is_approved: true })
      .in("id", [...selected]);
    setBusy(false);
    if (error) {
      toast.error("Couldn't approve items", { description: error.message });
      return;
    }
    toast.success(
      `Added ${selected.size} item${selected.size > 1 ? "s" : ""} to your wardrobe`,
    );
    setSelected(new Set());
    router.refresh();
  }

  async function handleDiscard() {
    if (selected.size === 0) return;
    setBusy(true);
    const supabase = createClient();
    const toDiscard = items.filter((row) => selected.has(row.id));

    const results = await Promise.allSettled(
      toDiscard.map((row) =>
        supabase.rpc("discard_wardrobe_item", { p_wardrobe_item_id: row.id }),
      ),
    );

    // Best-effort — a failed Storage cleanup shouldn't block the user
    // or get reported as an error; the DB rows are already gone.
    const paths = toDiscard
      .flatMap((row) => [
        pathFromPublicUrl(row.image_url),
        pathFromPublicUrl(row.item?.image_url),
      ])
      .filter((p): p is string => !!p);
    deleteWardrobeImages(paths).catch(() => {});

    setBusy(false);
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      toast.error(`Couldn't discard ${failed} item${failed > 1 ? "s" : ""}`);
    }
    setSelected(new Set());
    router.refresh();
  }

  const openItem = items.find((i) => i.id === openId) ?? null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
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

      <div className="mt-8 flex flex-col gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          We found these pieces.
        </Typography>
        <Typography variant="subtitle">
          Select what to add to your wardrobe.
        </Typography>
      </div>

      {items.length === 0 ? (
        <Typography variant="subtitle" className="mt-16 text-center">
          Nothing waiting for review.
        </Typography>
      ) : (
        <div className="mt-8 grid grid-cols-2 content-start gap-4">
          {items.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setOpenId(row.id)}
              className="border-border flex flex-col gap-2 rounded-2xl border p-3 text-left"
            >
              <div className="relative">
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
                <div
                  className="absolute top-2 right-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggleSelected(row.id)}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base">
                  {row.item?.name || "Untitled"}
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(row.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button
          type="button"
          className="flex-1"
          disabled={busy || selected.size === 0}
          onClick={handleApprove}
        >
          Approve
        </Button>
        <button
          type="button"
          onClick={handleDiscard}
          disabled={busy || selected.size === 0}
          aria-label="Discard selected"
          className="bg-secondary flex size-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {openItem && (
        <ApprovalItemDialog
          item={openItem}
          gender={gender}
          onOpenChange={(open) => {
            if (!open) setOpenId(null);
          }}
          onSaved={() => {
            setOpenId(null);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}
