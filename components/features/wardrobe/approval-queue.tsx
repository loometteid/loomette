"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { ApprovalItemDialog } from "./approval-item-dialog";
import { getPendingWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-pending-items.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "./query-options/get-pending-count.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-wardrobe-items.query-option.client";
import { getUserGenderQueryOptionsForBrowser } from "./query-options/get-user-gender.query-option.client";
import { approveWardrobeItemsMutationOptions } from "./mutation-options/approve-wardrobe-items.mutation-option.client";
import { discardWardrobeItemsMutationOptions } from "./mutation-options/discard-wardrobe-items.mutation-option.client";

// Checkboxes are a plain multi-select over the queue: Approve acts on
// whatever's checked (sets is_approved=true), the trash icon discards
// whatever's checked. Figma didn't fully spec the trash icon's exact
// semantics (bulk-clear vs. selection-based) — this is the more
// standard inbox-style pattern and symmetric with Approve.
export function ApprovalQueue({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: items } = useSuspenseQuery(
    getPendingWardrobeItemsQueryOptionsForBrowser(userId),
  );
  const { data: gender } = useSuspenseQuery(
    getUserGenderQueryOptionsForBrowser(userId),
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const approveMutation = useMutation({
    ...approveWardrobeItemsMutationOptions(),
    onSuccess: (_, variables) => {
      toast.success(
        `Added ${variables.itemIds.length} item${variables.itemIds.length > 1 ? "s" : ""} to your wardrobe`,
      );
      setSelected(new Set());
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
    },
    onError: (err) => {
      toast.error("Couldn't approve items", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
  });

  const discardMutation = useMutation({
    ...discardWardrobeItemsMutationOptions(),
    onSuccess: () => {
      setSelected(new Set());
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
    },
    onError: (err) => {
      toast.error("Couldn't discard items", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
  });

  const busy = approveMutation.isPending || discardMutation.isPending;

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleApprove() {
    if (selected.size === 0) return;
    approveMutation.mutate({ itemIds: [...selected] });
  }

  function handleDiscard() {
    if (selected.size === 0) return;
    const toDiscard = items
      .filter((row) => selected.has(row.id))
      .map((row) => ({
        id: row.id,
        imageUrls: [row.image_url, row.item?.image_url],
      }));

    discardMutation.mutate({ items: toDiscard });
  }

  const openItem = items.find((i) => i.id === openId) ?? null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() => router.push("/wardrobe")}
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Approval Queue
          </Typography>
        </div>
        <span className="text-muted-foreground text-xs uppercase">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <Typography variant="subtitle" className="text-center">
            All caught up. Nothing to review.
          </Typography>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {items.map((row) => {
            const isChecked = selected.has(row.id);
            return (
              <div
                key={row.id}
                className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleSelected(row.id)}
                  aria-label={`Select ${row.item?.name || "item"}`}
                />
                <button
                  type="button"
                  onClick={() => setOpenId(row.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="bg-secondary relative size-14 shrink-0 overflow-hidden rounded-xl">
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
                    <span className="text-muted-foreground text-xs">
                      {[row.item?.brand, row.item?.category]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button
          type="button"
          className="flex-1"
          disabled={busy || selected.size === 0}
          onClick={handleApprove}
        >
          {approveMutation.isPending ? "Approving…" : "Approve"}
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
            void queryClient.invalidateQueries({
              queryKey: getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
            });
            void queryClient.invalidateQueries({
              queryKey: getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
            });
            void queryClient.invalidateQueries({
              queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
            });
          }}
        />
      )}
    </main>
  );
}
