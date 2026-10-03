"use client";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { isProfileOnboarded, type OnboardingProfileLike } from "../utils";

/**
 * Client-side guard hook for Next.js App Router streaming pages.
 *
 * Checks if the user profile satisfies onboarding criteria. If not,
 * seamlessly redirects to the onboarding flow via `router.replace`
 * without blocking server streaming (TTFB).
 * 
 * The reverse logic is handled by `useAlreadyOnboardedGuard()`
 */
export function useOnboardingGuard(
  profile: OnboardingProfileLike | null | undefined,
  redirectUrl: Route = "/onboarding/1",
) {
  const isOnboarded = isProfileOnboarded(profile);

  if (!isOnboarded) {
    throw redirect(redirectUrl);
  }
}
