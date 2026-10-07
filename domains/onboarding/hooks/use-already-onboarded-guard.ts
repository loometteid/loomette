"use client";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { isProfileOnboarded, type OnboardingProfileLike } from "../utils";

/**
 * Client-side guard hook for onboarding entry pages (e.g. /onboarding/1).
 *
 * Checks if the user profile satisfies onboarding criteria. If so,
 * seamlessly redirects to the post-onboarding flow (e.g. /onboarding/7).
 * 
 * The reverse logic is handled by `useOnboardingGuard()`
 */
export function useAlreadyOnboardedGuard(
  profile: OnboardingProfileLike | null | undefined,
  redirectUrl: Route = "/onboarding/7",
) {
  const isOnboarded = isProfileOnboarded(profile);

  if (isOnboarded) {
    throw redirect(redirectUrl);
  }
}
