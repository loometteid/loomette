import { Typography } from "@/components/ui/typography";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6 py-16 text-center">
      <Typography variant="title" as="h1">
        Privacy & Policy
      </Typography>
      {/* No privacy policy content exists yet — placeholder, same
          convention as the FAQ's "Content coming soon." entries in
          app/page.tsx. */}
      <Typography variant="subtitle">Content coming soon.</Typography>
    </main>
  );
}
