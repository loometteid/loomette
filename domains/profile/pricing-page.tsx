"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import type { BillingCycle } from "@/lib/payments";
import { createCheckoutSessionAction } from "./actions/create-checkout-session.action";
import { ProfileBreadcrumb } from "./components/profile-breadcrumb";

export function PricingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isPending, startTransition] = useTransition();

  // Listen for redirected payment status
  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    if (paymentStatus === "success") {
      toast.success("Welcome to Loomette Pro! Your subscription is active.");
    } else if (paymentStatus === "canceled") {
      toast.info("Payment checkout was canceled. You can try again anytime.");
    }
  }, [searchParams]);

  function handleUpgrade() {
    startTransition(async () => {
      try {
        const result = await createCheckoutSessionAction(billingCycle);
        if (!result.success) {
          toast.error(result.error || "Failed to start checkout. Please try again.");
          return;
        }

        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          toast.info("Checkout initiated. Awaiting confirmation.");
        }
      } catch {
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-5xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb (desktop) */}
      <ProfileBreadcrumb
        items={[
          { label: "PROFILE", href: "/profile" },
          { label: "SETTINGS", href: "/profile/settings" },
          { label: "PRICING" },
        ]}
      />

      {/* Mobile back button */}
      <div className="flex items-center justify-between lg:hidden">
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
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Sparkle className="size-6 text-foreground" />
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] md:text-[44px] font-normal leading-tight text-foreground"
          >
            Pricing
          </Typography>
        </div>
        <Typography
          variant="subtitle"
          className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground max-w-md"
        >
          See what you&apos;re on and what&apos;s waiting when you&apos;re ready to upgrade.
        </Typography>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center md:justify-start items-center">
        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="inline-flex items-center gap-1 bg-[#F2EDE5] p-1.5 rounded-full border border-[#EAE4DC]"
        >
          <button
            type="button"
            role="radio"
            aria-checked={billingCycle === "monthly"}
            data-testid="billing-cycle-toggle-monthly"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-[#383733] text-white shadow-sm"
                : "text-[#666660] hover:text-[#2A2926]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={billingCycle === "annual"}
            data-testid="billing-cycle-toggle-annual"
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              billingCycle === "annual"
                ? "bg-[#383733] text-white shadow-sm"
                : "text-[#666660] hover:text-[#2A2926]"
            }`}
          >
            <span>Annual</span>
            <span
              className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                billingCycle === "annual"
                  ? "bg-white/20 text-white"
                  : "bg-[#EAE4DC] text-[#383733]"
              }`}
            >
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Starter Plan */}
        <div className="bg-[#FAF8F5]/80 border border-[#EAE4DC] rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground">
              Starter
            </span>
            <span className="bg-[#F2EDE5] text-[#444440] font-sans text-[10px] font-normal tracking-wider uppercase px-3 py-1 rounded-full">
              Current Plan
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-serif text-[36px] md:text-4xl font-normal text-foreground leading-tight">
              Free
            </span>
            <span className="font-sans text-xs font-normal text-muted-foreground tracking-wide">
              Forever
            </span>
          </div>

          <div className="h-px w-full bg-[#EAE4DC]" />

          <ul className="flex flex-col gap-3.5 font-sans text-xs font-normal text-foreground/90">
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Up to 30 wardrobe items</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>5 outfit logs per month</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>AI detection for every upload</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Calendar view</span>
            </li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#FAF8F5]/80 border border-[#EAE4DC] rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground">
              Pro
            </span>
            <span className="bg-[#383733] text-white font-sans text-[10px] font-normal tracking-wider uppercase px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5">
              <span
                data-testid="pro-price-display"
                className="font-serif text-[36px] md:text-4xl font-normal text-foreground leading-tight"
              >
                {billingCycle === "annual" ? "Rp 470k" : "Rp 49k"}
              </span>
              <span className="font-sans text-xs font-normal text-muted-foreground">
                {billingCycle === "annual" ? "/year" : "/month"}
              </span>
            </div>
            <span className="font-sans text-xs font-normal text-muted-foreground tracking-wide">
              {billingCycle === "annual"
                ? "~Rp 39.166 / month (Save 20%)"
                : "Rp 470k / year — save 20%"}
            </span>
          </div>

          <div className="h-px w-full bg-[#EAE4DC]" />

          <ul className="flex flex-col gap-3.5 font-sans text-xs font-normal text-foreground/90">
            <li className="flex items-center gap-3 font-medium">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Everything in Starter, plus:</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Unlimited wardrobe items</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Unlimited outfit logs</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Weekly style recap</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Wear insights and analytics</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Priority processing</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 text-foreground/70 shrink-0" />
              <span>Export your wardrobe data</span>
            </li>
          </ul>

          <Button
            type="button"
            disabled={isPending}
            data-testid="upgrade-pro-button"
            onClick={handleUpgrade}
            className="w-full mt-2 bg-[#383733] hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none cursor-pointer disabled:opacity-70"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Preparing Checkout...
              </span>
            ) : (
              "Upgrade to Pro"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
