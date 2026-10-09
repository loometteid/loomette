import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import skyImage from "@/domains/auth/assets/sky.png";
import silverHangerImage from "@/domains/auth/assets/silver-hanger.png";
import blackHangerImage from "@/domains/auth/assets/black-hanger.png";

export function WaitlistFallback() {
  return (
    <div
      data-testid="waitlist-loading"
      className="flex min-h-dvh w-full flex-col bg-background lg:flex-row overflow-x-hidden"
    >
      {/* Left Column: Desktop Visual Sky and Mascots Banner */}
      <section
        aria-label="Loomette Waitlist Visual Loading"
        className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-muted/20 select-none"
      >
        <div className="absolute inset-0">
          <Image
            src={skyImage}
            alt=""
            fill
            priority
            sizes="50vw"
            className="pointer-events-none object-cover grayscale contrast-125 select-none"
          />
        </div>

        {/* Silver hanger mascot */}
        <div className="pointer-events-none absolute top-[16%] -right-8 w-72 xl:w-88 drop-shadow-md z-20 select-none">
          <Image
            src={silverHangerImage}
            alt=""
            width={1536}
            height={1024}
            priority
            className="w-full h-auto select-none"
          />
        </div>

        {/* Black hanger mascot */}
        <div className="pointer-events-none absolute -bottom-6 -left-10 w-80 xl:w-96 drop-shadow-xl z-20 select-none">
          <Image
            src={blackHangerImage}
            alt=""
            width={1536}
            height={1024}
            priority
            className="w-full h-auto select-none"
          />
        </div>
      </section>

      {/* Right Column: Skeleton Form Panel */}
      <section
        aria-label="Waitlist Form Loading"
        className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:px-12 xl:px-16 min-h-dvh lg:h-screen"
      >
        <div className="flex flex-1 flex-col justify-between max-w-md w-full mx-auto">
          {/* Top Bar Skeleton */}
          <div className="flex items-center pb-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled
              className="rounded-xl size-10 shrink-0 opacity-50"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {/* Content Area Skeleton */}
          <div className="flex flex-1 flex-col my-auto py-6 animate-pulse">
            <div className="flex flex-col gap-2">
              <Sparkle className="size-6 text-muted-foreground/40 shrink-0" />
              <div className="h-8 w-56 rounded-md bg-secondary" />
              <div className="h-4 w-72 rounded-md bg-secondary/70 mt-1" />
            </div>

            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-28 rounded bg-secondary" />
                <div className="h-11 rounded-xl bg-secondary/80" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 rounded bg-secondary" />
                <div className="h-11 rounded-xl bg-secondary/80" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-40 rounded bg-secondary" />
                <div className="h-28 rounded-xl bg-secondary/80" />
              </div>
              <div className="pt-3">
                <div className="h-12 rounded-2xl bg-secondary" />
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <div className="h-3 w-32 rounded bg-secondary/40 mx-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default WaitlistFallback;
