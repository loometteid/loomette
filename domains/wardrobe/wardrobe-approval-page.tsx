"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { cn } from "@/lib/utils";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { ApprovalItemDialog } from "./components/approval-item-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { getPendingWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-pending-items.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "./query-options/get-pending-count.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-wardrobe-items.query-option.client";
import { getUserGenderQueryOptionsForBrowser } from "./query-options/get-user-gender.query-option.client";
import { useUploadJobsWatcher } from "./hooks/use-upload-jobs-watcher";
import { approveWardrobeItemsMutationOptions } from "./mutation-options/approve-wardrobe-items.mutation-option.client";
import { discardWardrobeItemsMutationOptions } from "./mutation-options/discard-wardrobe-items.mutation-option.client";
import { getItemApprovalStatus } from "./schemas/wardrobe-item.schema";

function formatCardDate(isoDateString?: string | null) {
  if (!isoDateString) return "";
  try {
    const d = new Date(isoDateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}.${minutes}`;
  } catch {
    return "";
  }
}

export function ApprovalQueue({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: items } = useSuspenseQuery(
    getPendingWardrobeItemsQueryOptionsForBrowser(userId),
  );
  const { data: gender } = useSuspenseQuery(
    getUserGenderQueryOptionsForBrowser(userId),
  );
  const { activeJobs, hasActiveJobs, latestFailedJob } =
    useUploadJobsWatcher(userId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const approveMutation = useMutation({
    ...approveWardrobeItemsMutationOptions(),
    onSuccess: (_, variables) => {
      toast.success(
        `Added ${variables.itemIds.length} item${variables.itemIds.length > 1 ? "s" : ""} to your wardrobe`,
      );
      setSelected(new Set());
      void queryClient.invalidateQueries({
        queryKey:
          getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey:
          getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: ["wardrobe"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["mix-and-match"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["outfits"],
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
      toast.success("Items removed");
      setSelected(new Set());
      setDeleteConfirmOpen(false);
      void queryClient.invalidateQueries({
        queryKey:
          getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey:
          getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: ["wardrobe"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["mix-and-match"],
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

  // Story 2.11 validation check
  const invalidSelectedItems = useMemo(() => {
    return items.filter(
      (row) => selected.has(row.id) && !getItemApprovalStatus(row).canApprove,
    );
  }, [items, selected]);

  const canApprove = selected.size > 0 && invalidSelectedItems.length === 0;

  function handleApprove() {
    if (selected.size === 0) return;
    if (invalidSelectedItems.length > 0) {
      toast.error("Missing required details", {
        description:
          "Please set Category and Subcategory for all selected items before approving.",
      });
      return;
    }
    approveMutation.mutate({ itemIds: [...selected] });
  }

  function handleConfirmDiscard() {
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

  const isJobRunning = hasActiveJobs;
  const isJobFailed = !hasActiveJobs && !!latestFailedJob;

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      data-testid="approval-queue"
      data-entity-id={userId}
    >
      <DesktopNav userId={userId} />
      <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col px-6 py-8">
        {/* Mobile Back Button */}
        <div className="flex items-center lg:hidden">
          <Link
            href="/wardrobe"
            prefetch
            aria-label="Go back"
            data-testid="approval-queue__back-button"
            className="bg-secondary flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-secondary/80"
          >
            <ChevronLeft className="size-4" />
          </Link>
        </div>

        {/* Title Header */}
        <div className="mt-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkle className="size-6 text-foreground" />
            <Typography
              variant="title"
              as="h1"
              className="text-3xl font-serif"
              data-testid="approval-queue__title"
            >
              We found these pieces.
            </Typography>
          </div>
          <p className="text-muted-foreground text-[0.68rem] font-medium uppercase tracking-widest">
            Select what to add to your wardrobe.
          </p>
        </div>

        {/* Background Job In-Progress Banner */}
        {isJobRunning && (
          <div
            className="mt-6 flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/50 p-4"
            data-testid="approval-queue__processing-banner"
          >
            <Loader2 className="size-4 animate-spin text-foreground shrink-0" />
            <span className="text-xs font-medium text-foreground">
              Analyzing {activeJobs.length > 1 ? `${activeJobs.length} photos` : "your photo"} in the background… Extracted pieces will appear below automatically.
            </span>
          </div>
        )}

        {/* Job Failed Banner with Retry */}
        {isJobFailed && (
          <div
            className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
            data-testid="approval-queue__error-banner"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <span className="text-xs font-medium text-destructive">
                {latestFailedJob?.error_message ||
                  "Could not detect garments in last upload."}
              </span>
            </div>
            <Link
              href="/wardrobe/add"
              prefetch
              className="flex items-center gap-1 text-xs font-semibold text-destructive underline uppercase tracking-wider"
            >
              <RefreshCw className="size-3" />
              Retry
            </Link>
          </div>
        )}

        {/* Garment Grid / Empty State */}
        {items.length === 0 ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center"
            data-testid="approval-queue__empty-state"
          >
            <Sparkle className="size-8 text-muted-foreground/40" />
            <Typography variant="subtitle">
              All caught up. Nothing to review.
            </Typography>
            <Link
              href="/wardrobe/add"
              prefetch
              className="bg-[#393735] hover:bg-[#2b2a27] text-white mt-4 rounded-xl px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Add New Item
            </Link>
          </div>
        ) : (
          <div
            className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
            data-testid="approval-queue__grid"
          >
            {items.map((row) => {
              const isChecked = selected.has(row.id);
              const approvalStatus = getItemApprovalStatus(row);
              const isInvalidSelected = isChecked && !approvalStatus.canApprove;

              return (
                <div
                  key={row.id}
                  onClick={() => setOpenId(row.id)}
                  data-testid="approval-queue__item"
                  data-entity-id={row.id}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-3xl border bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] p-3 text-center transition-all cursor-pointer hover:shadow-sm",
                    isChecked
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-[#EAE4DC]",
                    isInvalidSelected &&
                      "ring-2 ring-destructive border-destructive bg-destructive/5",
                  )}
                >
                  {/* Top bar with Selection Checkbox */}
                  <div className="flex items-center justify-between w-full z-10">
                    {row.is_duplicate ? (
                      <span
                        className="bg-amber-100 text-amber-900 border border-amber-300 rounded-md px-1.5 py-0.5 text-[0.62rem] font-medium tracking-wide"
                        data-testid="approval-queue__duplicate-badge"
                      >
                        Possible duplicate
                      </span>
                    ) : (
                      <div />
                    )}

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSelected(row.id)}
                        aria-label={`Select ${row.item?.name || "item"}`}
                        data-testid="approval-queue__item-checkbox"
                        data-entity-id={row.id}
                        className="size-5 lg:size-7 rounded-md lg:rounded-lg border-[#C9C3B7] data-[checked]:bg-[#444440] data-[checked]:border-[#444440] text-white"
                      />
                    </div>
                  </div>

                  {/* Garment Floating Image Preview */}
                  <div className="relative aspect-square w-full my-2 flex flex-col items-center justify-center">
                    <div className="relative h-full w-full flex items-center justify-center">
                      {row.item?.image_url && (
                        <Image
                          src={row.item.image_url}
                          alt={row.item.name || "Garment"}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-2 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="h-1.5 w-14 rounded-full bg-black/10 blur-[2px] transition-transform duration-200 group-hover:scale-110" />
                  </div>

                  {/* Text Details & Validation Warnings */}
                  <div className="mt-1 flex flex-col items-center gap-0.5 w-full text-center">
                    <span
                      className="font-serif text-base text-foreground font-medium truncate w-full"
                      data-testid="approval-queue__item-name"
                    >
                      {row.item?.name || "Untitled"}
                    </span>
                    <span
                      className="text-[#8C887B] text-[0.68rem] tracking-wider"
                      data-testid="approval-queue__item-date"
                    >
                      {formatCardDate(row.created_at)}
                    </span>

                    {/* Story 2.11 Missing field message */}
                    {!approvalStatus.canApprove && (
                      <div
                        className="mt-1 flex items-center justify-center gap-1 text-[0.65rem] text-destructive font-medium"
                        data-testid="approval-queue__validation-warning"
                      >
                        <AlertTriangle className="size-3 shrink-0" />
                        <span>
                          Needs {approvalStatus.missingFields.join(" & ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Actions Bar */}
        {items.length > 0 && (
          <div className="mt-12 flex items-center gap-4 lg:justify-end">
            {/* Mobile Actions */}
            <div className="flex w-full items-center gap-3 lg:hidden">
              <button
                type="button"
                disabled={busy || selected.size === 0 || !canApprove}
                onClick={handleApprove}
                data-testid="approval-queue__approve-button"
                className={cn(
                  "bg-[#444440] hover:bg-[#333330] text-white flex-1 flex items-center justify-center rounded-2xl h-14 text-xs font-semibold uppercase tracking-wider shadow-lg transition-transform active:scale-95 disabled:opacity-40",
                  !canApprove &&
                    selected.size > 0 &&
                    "opacity-60 cursor-not-allowed",
                )}
              >
                {approveMutation.isPending ? "Approving…" : "Approve"}
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={busy || selected.size === 0}
                aria-label="Discard selected"
                data-testid="approval-queue__discard-button"
                className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex size-14 shrink-0 items-center justify-center rounded-2xl transition-colors disabled:opacity-40"
              >
                <Trash2 className="size-5" />
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                type="button"
                disabled={busy || selected.size === 0 || !canApprove}
                onClick={handleApprove}
                data-testid="approval-queue__approve-button-desktop"
                className={cn(
                  "bg-[#444440] hover:bg-[#333330] text-white px-12 h-14 rounded-2xl text-xs font-semibold uppercase tracking-wider shadow-md transition-colors disabled:opacity-40",
                  !canApprove &&
                    selected.size > 0 &&
                    "opacity-60 cursor-not-allowed",
                )}
              >
                {approveMutation.isPending ? "Approving…" : "Approve"}
              </button>

              <button
                type="button"
                disabled={busy || selected.size === 0}
                onClick={() => setDeleteConfirmOpen(true)}
                data-testid="approval-queue__discard-button-desktop"
                className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] px-12 h-14 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Edit Item Pop-Up Dialog (Figma 3.1.1 & D.3.1.1) */}
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
                queryKey:
                  getPendingWardrobeItemsQueryOptionsForBrowser(userId)
                    .queryKey,
              });
              void queryClient.invalidateQueries({
                queryKey:
                  getPendingWardrobeCountQueryOptionsForBrowser(userId)
                    .queryKey,
              });
              void queryClient.invalidateQueries({
                queryKey:
                  getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
              });
            }}
          />
        )}

        {/* Delete Confirmation Modal (Figma 3.1.2) */}
        <DeleteConfirmDialog
          open={deleteConfirmOpen}
          count={selected.size}
          isDeleting={discardMutation.isPending}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleConfirmDiscard}
        />
      </main>
    </div>
  );
}
