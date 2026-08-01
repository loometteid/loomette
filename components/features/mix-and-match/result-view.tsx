"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup } from "@/components/ui/dialog";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/client";
import { dateKey, todayParts } from "@/components/features/calendar/date-utils";
import { OutfitComposition } from "@/components/features/outfit/outfit-composition";
import type { ResultItem } from "./result-types";

export function MixAndMatchResult({
  outfitId,
  initialName,
  initialIsSaved,
  items,
}: {
  outfitId: string;
  initialName: string | null;
  initialIsSaved: boolean;
  items: ResultItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "My Look");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [addedToCollection, setAddedToCollection] = useState(initialIsSaved);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [busy, setBusy] = useState<"collection" | "calendar" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function commitName() {
    setEditingName(false);
    const trimmed = name.trim() || "My Look";
    setName(trimmed);
    setSavingName(true);
    const supabase = createClient();
    await supabase.from("outfit").update({ name: trimmed }).eq("id", outfitId);
    setSavingName(false);
  }

  async function handleAddToCollection() {
    if (addedToCollection) return;
    setBusy("collection");
    const supabase = createClient();
    const { error } = await supabase
      .from("outfit")
      .update({ is_saved: true })
      .eq("id", outfitId);
    setBusy(null);
    if (error) {
      toast.error("Couldn't add that to your collection.");
      return;
    }
    setAddedToCollection(true);
    setShowSuccess(true);
  }

  async function handleAddToCalendar() {
    if (addedToCalendar) return;
    setBusy("calendar");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(null);
      router.push("/sign-in");
      return;
    }
    const today = todayParts();
    const { error } = await supabase.from("wear_log").insert({
      user_id: user.id,
      outfit_id: outfitId,
      worn_on: dateKey(today.year, today.month, today.day),
    });
    setBusy(null);
    if (error) {
      toast.error("Couldn't add that to your calendar.");
      return;
    }
    setAddedToCalendar(true);
    setShowSuccess(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
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

      <div className="flex items-center gap-2">
        <Sparkle className="text-foreground size-5" />
        <Typography variant="title" as="h1">
          What a Match!
        </Typography>
      </div>

      <OutfitComposition items={items} className="aspect-5/6 w-full" />

      <div className="flex items-center justify-center gap-2 text-center">
        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className="font-serif text-title border-border w-full border-b bg-transparent text-center outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            disabled={savingName}
            className="inline-flex items-center gap-2"
          >
            <Typography variant="title" as="span">
              {name}
            </Typography>
            <Pencil className="text-muted-foreground size-4 shrink-0" />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddToCollection}
          disabled={busy !== null}
          className="bg-secondary text-secondary-foreground flex-1 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
        >
          {addedToCollection ? "Added ✓" : "Add to Collection"}
        </button>
        <button
          type="button"
          onClick={handleAddToCalendar}
          disabled={busy !== null}
          className="bg-foreground text-background flex-1 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
        >
          {addedToCalendar ? "Added ✓" : "Add to Calendar"}
        </button>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogPopup showClose={false}>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
            className="bg-secondary absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Sparkle className="text-foreground -rotate-12 size-28" />
            <Typography variant="title" as="p">
              Logged. <em className="italic underline">Love</em> this one.
            </Typography>
            <Typography variant="subtitle">Your look is in.</Typography>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="bg-foreground text-background w-full rounded-full py-3 text-sm font-medium tracking-wide uppercase"
            >
              Stay In
            </button>
          </div>
        </DialogPopup>
      </Dialog>
    </main>
  );
}
