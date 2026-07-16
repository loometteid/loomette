import Link from "next/link";

// Loomette's 8-point sparkle mark — recurs as the logo glyph and as a
// section divider throughout the app. Duplicated from app/page.tsx by
// design colocation; worth lifting to components/ui/sparkle.tsx once a
// third caller shows up (see house rules — no premature abstraction).
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
    </svg>
  );
}

export default function SplashPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* The whole screen is the tap target — no client JS needed, Link
          already handles navigation on click/tap natively. */}
      <Link
        href="/welcome"
        aria-label="Continue to Loomette"
        className="flex flex-1 flex-col items-center justify-between px-6 pt-32 pb-16 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <Sparkle className="size-20 text-foreground" />
          <span className="font-serif text-2xl text-foreground">TBC.</span>
        </div>

        <p className="font-sans text-xs tracking-wide text-muted-foreground uppercase">
          Your <em className="font-bold underline">wardrobe</em>. Finally,{" "}
          <em className="font-bold">organized</em>.
        </p>
      </Link>
    </main>
  );
}
