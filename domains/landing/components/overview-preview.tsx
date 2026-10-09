import Image from "next/image";
import { Sparkle } from "@/components/ui/sparkle";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

// Fills the "Everything in one place" frame with a small, static peek
// at the real flow — upload, review the detected pieces, see the
// wardrobe add up — built from brand assets and design tokens rather
// than a screenshot, so it stays crisp and on-palette at every width.

const detectedPieces = [
  { name: "Blue oxford shirt", category: "Tops", swatch: "bg-blue-3" },
  { name: "Polkadot midi skirt", category: "Bottoms", swatch: "bg-linen" },
  { name: "Pink sneakers", category: "Shoes", swatch: "bg-tertiary-pink" },
  { name: "Silk scarf", category: "Accessories", swatch: "bg-secondary-pink" },
];

const wardrobeCounts = [
  { label: "Tops", count: 24 },
  { label: "Bottoms", count: 18 },
  { label: "Shoes", count: 9 },
  { label: "Accessories", count: 12 },
];

const progressSteps = [
  "Photo received",
  "Pieces identified",
  "Added to wardrobe",
];

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 font-serif text-xs md:text-base lg:text-lg leading-tight text-slate">
      <Sparkle className="size-3 md:size-3.5 lg:size-4 shrink-0" />
      {children}
    </p>
  );
}

export function OverviewPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4 lg:gap-5 p-2.5 md:p-5 lg:p-6 text-left",
        className,
      )}
    >
      {/* Panel 1 — Upload & analyze */}
      <div className="landing-preview-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-xs">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#b9b9b6]">
          <Image
            src="/brand/sky.png"
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover object-[50%_30%] opacity-90"
          />
          <Image
            src="/brand/mascot-image-42.png"
            alt=""
            width={1536}
            height={1024}
            className="landing-float absolute left-1/2 top-1/2 w-3/5 max-w-56 -translate-x-1/2 -translate-y-1/2 h-auto select-none"
          />
        </div>
        <div className="flex flex-col gap-1 md:gap-1.5 px-2 py-1.5 md:p-3 lg:p-4">
          <PanelTitle>
            <span>
              <em className="italic">Analyzing</em> your look
            </span>
          </PanelTitle>
          <ul className="hidden sm:flex flex-col gap-1">
            {progressSteps.map((step, i) => (
              <li
                key={step}
                className="landing-preview-step flex items-center gap-1.5 text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-slate/80"
                style={{ animationDelay: `${600 + i * 700}ms` }}
              >
                <Sparkle className="size-2.5 md:size-3 shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Panel 2 — Review the detected pieces */}
      <div className="landing-preview-panel flex min-h-0 flex-col gap-1.5 md:gap-2.5 overflow-hidden rounded-xl md:rounded-2xl bg-white p-2.5 md:p-4 lg:p-5 shadow-xs">
        <PanelTitle>
          <span>
            We found these<span className="max-md:hidden"> pieces</span>.
          </span>
        </PanelTitle>
        <ul className="flex min-h-0 flex-col gap-1 md:gap-1.5 lg:gap-2">
          {detectedPieces.map((piece, i) => (
            <li
              key={piece.name}
              className={cn(
                "landing-preview-step flex items-center gap-2 rounded-lg border border-stone/40 px-1.5 py-1 md:px-2 md:py-1.5",
                i === detectedPieces.length - 1 && "max-md:hidden",
              )}
              style={{ animationDelay: `${300 + i * 250}ms` }}
            >
              <span
                className={cn(
                  "size-3.5 md:size-5 lg:size-6 shrink-0 rounded-md border border-stone/40",
                  piece.swatch,
                )}
              />
              <span className="min-w-0 flex-1 truncate text-[9px] md:text-xs lg:text-sm text-slate">
                {piece.name}
              </span>
              <span className="hidden lg:inline rounded-full bg-linen px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate/80">
                {piece.category}
              </span>
              <span
                className="landing-check flex size-3 md:size-4 shrink-0 items-center justify-center rounded-sm bg-slate text-[7px] md:text-[9px] leading-none text-white"
                style={{ animationDelay: `${550 + i * 250}ms` }}
              >
                ✓
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto hidden md:flex h-9 lg:h-11 shrink-0 items-center justify-center rounded-lg lg:rounded-xl bg-slate text-[10px] lg:text-xs font-medium uppercase tracking-[0.15em] text-white">
          Approve {detectedPieces.length} pieces
        </div>
      </div>

      {/* Panel 3 — The wardrobe adds up (desktop only) */}
      <div className="landing-preview-panel hidden md:flex min-h-0 flex-col gap-2.5 overflow-hidden rounded-2xl bg-slate p-4 lg:p-5 text-white shadow-xs">
        <p className="flex items-center gap-1.5 font-serif text-base lg:text-lg">
          <Sparkle className="size-3.5 lg:size-4 shrink-0" />
          Your wardrobe
        </p>
        <div className="grid grid-cols-2 gap-2 lg:gap-2.5">
          {wardrobeCounts.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-white/10 px-3 py-2 lg:py-2.5"
            >
              <CountUp
                value={String(item.count)}
                duration={1100}
                className="block font-serif text-xl lg:text-3xl font-bold italic leading-none tabular-nums"
              />
              <p className="pt-1 text-[10px] lg:text-xs uppercase tracking-wider text-white/70">
                {item.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-xl border border-white/20 px-3 py-2 lg:py-2.5">
          <p className="text-[10px] lg:text-xs uppercase tracking-wider text-white/70">
            Most worn this month
          </p>
          <p className="font-serif text-sm lg:text-base">
            White linen shirt · <em className="italic">9×</em>
          </p>
        </div>
      </div>
    </div>
  );
}
