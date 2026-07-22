import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

// Placeholder — the real 4.1 Profile - Favorite.png feature is
// unscoped future work. This only exists so the bottom nav tab
// doesn't 404.
export default function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col items-center gap-2 px-6 py-16 text-center">
      <Sparkle className="size-5 text-foreground" />
      <Typography variant="title" as="h1">
        Coming soon.
      </Typography>
      <Typography variant="subtitle">Your profile is on its way.</Typography>
    </main>
  );
}
