export interface OnboardingProfileLike {
  display_name?: string | null;
  gender?: string | null;
  birthday?: string | null;
}

/**
 * Checks if a user has completed the onboarding requirements.
 *
 * Current criteria per onboarding steps 1 & 2:
 * 1. Name is required (profile.display_name).
 * 2. Identity or birthday is required (profile.gender or profile.birthday).
 */
export function isProfileOnboarded(
  profile: OnboardingProfileLike | null | undefined,
): boolean {
  if (!profile) return false;
  const hasDisplayName = Boolean(
    profile.display_name && profile.display_name.trim().length > 0,
  );
  const hasStepTwo = Boolean(
    (profile.gender && profile.gender.trim().length > 0) ||
      (profile.birthday && profile.birthday.trim().length > 0),
  );
  return hasDisplayName && hasStepTwo;
}
