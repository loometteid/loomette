"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import type { BillingCycle } from "@/lib/payments";
import { createCheckoutSessionAction } from "./actions/create-checkout-session.action";
import { cancelSubscriptionAction } from "./actions/cancel-subscription.action";
import { ProfileBreadcrumb } from "./components/profile-breadcrumb";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { getSubscriptionQueryOptionsForBrowser } from "./query-options/get-subscription.query-option.client";

export function PricingView({
  userId = "user-123",
}: {
  userId?: string;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isPending, startTransition] = useTransition();

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );
  const { data: subscription } = useSuspenseQuery(
    getSubscriptionQueryOptionsForBrowser(userId),
  );

  const isPro =
    profile?.subscription_tier === "premium" ||
    (subscription?.tier === "premium" && subscription?.status === "active");

  // Listen for redirected payment status
  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    if (paymentStatus === "success") {
      toast.success("Welcome to Loomette Pro! Your subscription is active.");
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: getProfileQueryOptionsForBrowser(userId).queryKey,
        });
        void queryClient.invalidateQueries({
          queryKey: getSubscriptionQueryOptionsForBrowser(userId).queryKey,
        });
      }
    } else if (paymentStatus === "canceled") {
      toast.info("Payment checkout was canceled. You can try again anytime.");
    }
  }, [searchParams, queryClient, userId]);

  function handleUpgrade() {
    startTransition(async () => {
      try {
        const result = await createCheckoutSessionAction(billingCycle);
        if (!result.success) {
          toast.error(result.error || "Failed to start checkout. Please try again.");
          return;
        }

        if (userId) {
          void queryClient.invalidateQueries({
            queryKey: getProfileQueryOptionsForBrowser(userId).queryKey,
          });
          void queryClient.invalidateQueries({
            queryKey: getSubscriptionQueryOptionsForBrowser(userId).queryKey,
          });
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

  function handleCancel() {
    startTransition(async () => {
      try {
        const result = await cancelSubscriptionAction();
        if (!result.success) {
          toast.error(result.error || "Failed to cancel subscription.");
          return;
        }
        toast.success("Subscription reset to Free (Starter) plan.");
        if (userId) {
          void queryClient.invalidateQueries({
            queryKey: getProfileQueryOptionsForBrowser(userId).queryKey,
          });
          void queryClient.invalidateQueries({
            queryKey: getSubscriptionQueryOptionsForBrowser(userId).queryKey,
          });
        }
      } catch {
        toast.error("Failed to cancel subscription.");
      }
    });
  }

  return (
    <main
      className="mx-auto flex w-full max-w-[402px] lg:max-w-[1088px] flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12"
      data-testid="pricing-page"
    >
      {/* Desktop Breadcrumb */}
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
          className="size-10 rounded-xl bg-linen text-foreground hover:bg-linen-dark"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>

      {/* Header title */}
      <div className="flex items-start gap-3.5 lg:gap-4">
        <Sparkle className="size-6 lg:size-8 text-foreground shrink-0 mt-1 lg:mt-2" />
        <div className="flex flex-col gap-1 lg:gap-2">
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal leading-tight text-foreground"
          >
            Pricing
          </Typography>
          <p className="font-sans text-xs md:text-sm lg:text-xl font-normal text-foreground max-w-xl leading-snug">
            see what you&apos;re on and what&apos;s waiting when you&apos;re ready to upgrade.
          </p>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center md:justify-start items-center">
        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="inline-flex items-center gap-1 bg-linen p-1.5 rounded-full border border-linen-dark"
        >
          <button
            type="button"
            role="radio"
            aria-checked={billingCycle === "monthly"}
            data-testid="billing-cycle-toggle-monthly"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-primary text-white shadow-sm"
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
                ? "bg-primary text-white shadow-sm"
                : "text-[#666660] hover:text-[#2A2926]"
            }`}
          >
            <span>Annual</span>
            <span
              className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                billingCycle === "annual"
                  ? "bg-white/20 text-white"
                  : "bg-linen-dark text-foreground"
              }`}
            >
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid (matches Figma 992px container, 480px card widths) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full max-w-[992px]">
        {/* Starter Plan */}
        <div className="bg-background/80 border border-linen-dark rounded-3xl p-8 flex flex-col gap-6 w-full md:max-w-[480px]">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground">
              Starter
            </span>
            {!isPro && (
              <span className="bg-linen text-foreground font-sans text-[10px] font-normal tracking-wider uppercase px-3 py-1 rounded-full">
                Current plan
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-serif text-[36px] md:text-4xl font-normal text-foreground leading-tight">
              Free
            </span>
            <span className="font-sans text-xs font-normal text-muted-foreground tracking-wide">
              Forever
            </span>
          </div>

          <div className="h-px w-full bg-linen-dark" />

          <ul className="flex flex-col gap-3.5 font-sans text-xs md:text-sm font-normal text-foreground/90">
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
        <div className="bg-background/80 border border-linen-dark rounded-3xl p-8 flex flex-col gap-6 shadow-sm w-full md:max-w-[480px]">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-normal tracking-wider uppercase text-muted-foreground">
              Pro
            </span>
            <span className="bg-primary text-white font-sans text-[10px] font-normal tracking-wider uppercase px-3 py-1 rounded-full">
              {isPro ? "Current plan" : "Most popular"}
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

          <div className="h-px w-full bg-linen-dark" />

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

          {isPro ? (
            <div className="flex flex-col gap-2 mt-2">
              <Button
                type="button"
                disabled
                data-testid="current-plan-button"
                className="w-full bg-linen-dark text-foreground font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none cursor-default"
              >
                Active Plan (Pro)
              </Button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancel}
                className="text-[11px] font-sans text-muted-foreground hover:text-foreground underline underline-offset-4 tracking-wider uppercase text-center mt-1 cursor-pointer"
              >
                {isPending ? "Updating..." : "Downgrade to Free (Mock)"}
              </button>
            </div>
          ) : (
            <Button
              type="button"
              disabled={isPending}
              data-testid="upgrade-pro-button"
              onClick={handleUpgrade}
              className="w-full mt-2 bg-primary hover:bg-[#2A2926] text-white font-sans text-xs font-normal tracking-wider uppercase py-3.5 rounded-xl border-none shadow-none cursor-pointer disabled:opacity-70"
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
          )}
        </div>
      </div>
    </main>
  );
}
