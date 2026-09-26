"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SEASON_OPTIONS, TRAVEL_COMPANION_OPTIONS } from "@/lib/tripOptions";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import type { Trip } from "./types";

export function EditTripForm({ trip }: { trip?: Trip }) {
  const router = useRouter();
  const isEdit = !!trip;

  const [name, setName] = useState(trip?.name ?? "");
  const [editingName, setEditingName] = useState(!isEdit);
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [season, setSeason] = useState<string | null>(trip?.season ?? null);
  const [companion, setCompanion] = useState<string | null>(
    trip?.travel_companion ?? null,
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!startDate || !endDate) {
      toast.error("Please pick both a start and end date.");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date can't be before the start date.");
      return;
    }

    setSaving(true);
    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      router.push("/sign-in");
      return;
    }

    const payload = {
      name: name.trim() || null,
      start_date: startDate,
      end_date: endDate,
      season: season as never,
      travel_companion: companion as never,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("trip")
        .update(payload)
        .eq("id", trip.id);
      setSaving(false);
      if (error) {
        toast.error("Couldn't save that trip.");
        return;
      }
      router.push(`/trip/${trip.id}`);
      return;
    }

    const { data, error } = await supabase
      .from("trip")
      .insert({ ...payload, user_id: user.id })
      .select("id")
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error("Couldn't save that trip.");
      return;
    }
    router.push(`/trip/${data.id}`);
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

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative h-40 w-40">
          <Image src="/profile/koper.png" alt="" fill className="object-contain" />
        </div>

        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            placeholder="Trip to..."
            className="font-serif text-title border-border w-full border-b bg-transparent text-center outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="inline-flex items-center gap-2"
          >
            <Typography variant="title" as="span">
              {name || "Trip to..."}
            </Typography>
            <Pencil className="text-muted-foreground size-4 shrink-0" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trip-start" className="text-muted-foreground text-xs tracking-wide uppercase">
            Start
          </Label>
          <Input
            id="trip-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trip-end" className="text-muted-foreground text-xs tracking-wide uppercase">
            End
          </Label>
          <Input
            id="trip-end"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-11"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Season
        </span>
        <PillToggleGroup
          options={SEASON_OPTIONS}
          isSelected={(value) => value === season}
          onToggle={(value) => setSeason(value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Travel Companion
        </span>
        <PillToggleGroup
          options={TRAVEL_COMPANION_OPTIONS}
          isSelected={(value) => value === companion}
          onToggle={(value) => setCompanion(value)}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-foreground text-background rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </main>
  );
}
