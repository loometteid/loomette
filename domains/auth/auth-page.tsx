import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "@/components/ui/sparkle";
import { GoogleSignInButton } from "./components/google-sign-in-button";
import skyImage from "./assets/sky.png";
import silverHangerImage from "./assets/silver-hanger.png";
import blackHangerImage from "./assets/black-hanger.png";
import sootSpriteImage from "./assets/soot-sprite.png";

export function AuthPage() {
  return (
    <main
      data-testid="auth-page"
      className="flex flex-col lg:flex-row h-dvh lg:h-screen w-full overflow-hidden bg-background"
    >
      {/* Visual Sky & Mascots Banner (Full-width, rotated sky on mobile, full-height on desktop) */}
      <section
        aria-label="Loomette Welcome Visual"
        data-testid="auth-page__visual-panel"
        className="relative w-full h-[58%] max-h-[58%] min-h-87.5 overflow-visible lg:overflow-hidden lg:w-[57.2%] lg:min-w-[57.2%] lg:h-full lg:max-h-full shrink-0 lg:shrink"
      >
        {/* Sky Container: Full-width and rotated on mobile, flush full-bleed on desktop */}
        <div className="absolute -inset-x-8 -top-12 bottom-2 sm:bottom-4 rounded-bl-[96px] rounded-br-[40px] overflow-hidden rotate-[-7deg] lg:rotate-0 lg:inset-0 lg:rounded-none shadow-none">
          <Image
            src={skyImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="pointer-events-none object-cover object-center select-none"
          />
        </div>

        {/* Silver hanger mascot: Top-right on both mobile and desktop */}
        <div className="pointer-events-none absolute top-4 sm:top-6 -right-4 sm:-right-2 lg:top-20 xl:top-28 lg:right-10 xl:right-16 w-40 sm:w-48 lg:w-80 xl:w-96 drop-shadow-md z-20 select-none">
          <Image
            src={silverHangerImage}
            alt=""
            width={1536}
            height={1024}
            priority
            className="w-full h-auto select-none"
          />
        </div>

        {/* Black soot sprite mascot: Mobile only, anchored to middle-left edge */}
        <div className="lg:hidden pointer-events-none absolute top-[56%] -left-8 sm:-left-9 w-24 sm:w-28 drop-shadow-md z-20 -translate-y-1/2 select-none">
          <Image
            src={sootSpriteImage}
            alt=""
            width={1271}
            height={1237}
            priority
            className="w-full h-auto select-none"
          />
        </div>

        {/* Headline Typography: Anchored top-left with breathing room */}
        <div className="relative z-20 pt-10 sm:pt-14 pl-6 sm:pl-8 lg:pt-20 xl:pt-24 lg:pl-14 xl:pl-20 max-w-[280px] sm:max-w-xs lg:max-w-lg text-white">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal leading-[1.08] tracking-tight text-white">
            Your{" "}
            <span className="font-bold underline decoration-white/90 underline-offset-4 lg:underline-offset-8 decoration-2">
              wardrobe
            </span>
            .
            <br />
            Finally, <span className="font-bold">organized</span>.
          </h1>
          <p className="mt-2.5 sm:mt-3 lg:mt-4 text-[10px] sm:text-xs lg:text-sm font-sans tracking-[0.16em] lg:tracking-[0.2em] uppercase text-white/85">
            Addresses the pain, promises the fix.
          </p>
        </div>

        {/* Desktop Black Hanger: Anchored bottom-left inside desktop left column */}
        <div className="hidden lg:block pointer-events-none absolute bottom-0 xl:bottom-2 -left-8 xl:-left-4 w-96 xl:w-115 drop-shadow-lg z-20 select-none">
          <Image
            src={blackHangerImage}
            alt=""
            width={1536}
            height={1024}
            priority
            className="w-full h-auto select-none"
          />
        </div>

        {/* Mobile Black Hanger: Overlaps out of sky card into lower section */}
        <div className="lg:hidden pointer-events-none absolute -bottom-7 sm:-bottom-9 -right-3 sm:right-1 w-52 sm:w-60 drop-shadow-xl z-30 select-none">
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

      {/* Auth Controls Panel */}
      <section
        aria-label="Sign in or Register"
        data-testid="auth-page__content-panel"
        className="w-full h-[42%] max-h-[42%] lg:w-[42.8%] lg:h-full lg:max-h-full flex flex-col items-center justify-center px-6 pb-6 pt-4 lg:p-12 xl:p-20 relative z-10 bg-transparent lg:bg-background shrink-0 lg:shrink"
      >
        <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-5 lg:gap-6 max-w-sm sm:max-w-md w-full mx-auto lg:mx-0">
          {/* Sparkle Asterisk + Title */}
          <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-5">
            <Sparkle className="size-10 sm:size-12 lg:size-15 text-slate shrink-0" />
            <h2
              data-testid="auth-page__title"
              className="font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-normal leading-[1.12] text-slate text-left"
            >
              <em className="font-bold italic">Register</em> or
              <br />
              <em className="font-bold italic">Sign in</em> now
            </h2>
          </div>

          {/* Privacy Policy disclaimer */}
          <p className="text-[11px] sm:text-xs lg:text-sm tracking-wider uppercase text-slate/75 leading-relaxed text-center lg:text-left max-w-xs sm:max-w-sm">
            By registering you agree to our{" "}
            <Link
              href="/privacy"
              prefetch
              data-testid="auth-page__privacy-link"
              className="font-bold underline underline-offset-4 text-slate hover:text-black transition-colors"
            >
              Privacy &amp; Policy
            </Link>
          </p>

          {/* Centered Google OAuth button */}
          <div className="flex justify-center w-full max-w-xs sm:max-w-sm pt-1 lg:pt-2">
            <GoogleSignInButton
              iconOnly
              data-testid="auth-page__google-button"
              className="size-18 sm:size-20 rounded-2xl border-stone/50 bg-white shadow-xs hover:border-slate/60 hover:bg-stone/10 transition-colors"
              iconClassName="size-8 sm:size-9"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
