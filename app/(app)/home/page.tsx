import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";

// Minimal stub for the redirect target after upload/onboarding. The
// full Figma homepage (outfit carousel, AI style suggestions, stats)
// is separate, unscoped future work — this only needs to exist so
// there's somewhere real to land.
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("user")
      .select("display_name")
      .eq("user_id", user.id)
      .single();
    displayName = profile?.display_name ?? null;
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-2 px-6 py-8">
      <Sparkle className="size-5 text-foreground" />
      <Typography variant="title" as="h1">
        Ready to style in,{" "}
        <em className="font-bold italic">{displayName ?? "there"}</em>?
      </Typography>
    </main>
  );
}
