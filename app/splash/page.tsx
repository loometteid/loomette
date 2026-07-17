import Link from "next/link";
import { Sparkle } from "@/components/ui/sparkle";

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
