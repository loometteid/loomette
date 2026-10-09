import { Suspense } from "react";
import { WaitlistPage } from "@/domains/waitlist/waitlist-page";
import { WaitlistFallback } from "@/domains/waitlist/waitlist-loading";

export const metadata = {
  title: "Join the Waitlist | Loomette",
  description: "Be the first in line. Your wardrobe, finally organized.",
};

export default function Page() {
  return (
    <Suspense fallback={<WaitlistFallback />}>
      <WaitlistPage />
    </Suspense>
  );
}
