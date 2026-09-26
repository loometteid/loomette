"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  signUpSchema,
  type SignUpFormValues,
} from "./schemas/sign-up.schema";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setError(null);
    const supabase = createBrowserSupabaseClient();

    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }
    toast.success("Account created", {
      description: "Sign in to get started.",
    });
    router.push("/sign-in");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing up…" : "Sign up"}
      </Button>
    </form>
  );
}
