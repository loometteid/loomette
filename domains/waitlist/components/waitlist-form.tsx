"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  waitlistSchema,
  type WaitlistFormValues,
} from "../schemas/waitlist.schema";
import { joinWaitlistMutationOptions } from "../mutation-options/join-waitlist.mutation-option.client";

export interface WaitlistFormProps {
  onSuccess: (submittedValues: WaitlistFormValues) => void;
  "data-testid"?: string;
}

export function WaitlistForm({
  onSuccess,
  "data-testid": dataTestId = "waitlist-form",
}: WaitlistFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      hurdles: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    ...joinWaitlistMutationOptions(),
  });

  const name = useWatch({ control, name: "name" });
  const email = useWatch({ control, name: "email" });
  const hurdles = useWatch({ control, name: "hurdles" });

  const isBusy = isSubmitting || isPending;
  const isFilled =
    Boolean(name?.trim()) &&
    Boolean(email?.trim()) &&
    Boolean(hurdles?.trim());

  async function onSubmit(values: WaitlistFormValues) {
    setServerError(null);
    try {
      await mutateAsync(values);
      onSuccess(values);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to join waitlist";
      setServerError(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-testid={dataTestId}
      className="flex flex-col gap-5 w-full"
    >
      {/* 1. Name */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="waitlist-name"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          What do we call you?
        </Label>
        <Input
          id="waitlist-name"
          data-testid="waitlist-form__name-input"
          placeholder="e.g. Gonjoi"
          disabled={isBusy}
          className="h-11 rounded-xl bg-secondary px-3.5 text-sm"
          {...register("name")}
        />
        {errors.name && (
          <p
            data-testid="waitlist-form__name-error"
            className="text-destructive text-xs"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      {/* 2. Email */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="waitlist-email"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Your email
        </Label>
        <Input
          id="waitlist-email"
          type="email"
          data-testid="waitlist-form__email-input"
          placeholder="you@example.com"
          disabled={isBusy}
          className="h-11 rounded-xl bg-secondary px-3.5 text-sm"
          {...register("email")}
        />
        {errors.email && (
          <p
            data-testid="waitlist-form__email-error"
            className="text-destructive text-xs"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* 3. Hurdles in fashion */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="waitlist-hurdles"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          What are your biggest hurdles in fashion?
        </Label>
        <Textarea
          id="waitlist-hurdles"
          data-testid="waitlist-form__hurdles-input"
          placeholder="e.g. Forgetting what I own, repeating outfits, hard to match colors..."
          disabled={isBusy}
          rows={4}
          className="rounded-xl bg-secondary px-3.5 py-3 text-sm min-h-28"
          {...register("hurdles")}
        />
        {errors.hurdles && (
          <p
            data-testid="waitlist-form__hurdles-error"
            className="text-destructive text-xs"
          >
            {errors.hurdles.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          data-testid="waitlist-form__error"
          className="text-destructive text-xs text-center"
        >
          {serverError}
        </p>
      )}

      {/* Submit Button */}
      <div className="pt-3">
        <Button
          type="submit"
          disabled={isBusy || !isFilled}
          data-testid="waitlist-form__submit-button"
          className="w-full h-12 rounded-2xl text-sm uppercase tracking-wider font-semibold shadow-sm transition-all"
        >
          {isBusy ? "Joining…" : "Join Waitlist"}
        </Button>
      </div>
    </form>
  );
}
