import { Suspense } from "react";
import { PricingView } from "@/domains/profile/pricing-page";
import { PricingFallback } from "@/domains/profile/pricing-loading";

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingFallback />}>
      <PricingView />
    </Suspense>
  );
}
