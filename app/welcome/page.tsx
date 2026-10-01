import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { GoogleSignInButton } from "@/domains/auth/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background min-h-screen">
      <div className="w-full min-h-screen lg:h-256 flex flex-col lg:flex-row overflow-hidden shadow-sm">
        {/* Left Visual Panel (width ~825px on 1440px) */}
        <section
          aria-label="Welcome Visual"
          className="relative w-full lg:w-[57.3%] min-h-115 lg:min-h-full overflow-hidden bg-slate flex flex-col justify-between p-8 sm:p-12 lg:p-20 text-white"
        >
          {/* Cloud sky background */}
          <Image
            src="/brand/sky.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="pointer-events-none object-cover object-center"
          />

          {/* Top-right silver asterisk ornament */}
          <Image
            src="/brand/asterisk-silver.png"
            alt=""
            width={205}
            height={309}
            className="pointer-events-none absolute top-6 right-6 lg:top-12 lg:right-12 w-28 sm:w-40 lg:w-55 h-auto drop-shadow-md z-10"
          />

          {/* Bottom-left black asterisk ornament */}
          <Image
            src="/brand/asterisk-black.png"
            alt=""
            width={218}
            height={270}
            className="pointer-events-none absolute -bottom-6 -left-6 lg:bottom-4 lg:left-6 w-36 sm:w-48 lg:w-65 h-auto drop-shadow-md z-10"
          />

          {/* Headline in top-left */}
          <div className="relative z-20 max-w-lg pt-4 lg:pt-8">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[60px] font-bold leading-[1.08] tracking-tight text-white">
              Your{" "}
              <span className="underline decoration-white/80 underline-offset-8">
                wardrobe
              </span>
              .
              <br />
              Finally, <span className="font-bold">organized</span>.
            </h1>
            <p className="mt-4 text-white/90 text-sm sm:text-base lg:text-xl font-normal tracking-wide">
              Addresses the pain, promises the fix.
            </p>
          </div>
        </section>

        {/* Right Authentication Panel (width ~615px on 1440px) */}
        <section
          aria-label="Sign in or Register"
          className="w-full lg:w-[42.7%] flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 lg:py-0 bg-background z-20"
        >
          <div className="w-full max-w-md mx-auto lg:mx-0 flex flex-col items-center lg:items-start text-center lg:text-left gap-7">
            {/* Title with Sparkle star icon */}
            <div className="flex items-center gap-4 lg:gap-5">
              <Sparkle className="size-12 lg:size-16 text-slate shrink-0" />
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.12] text-slate">
                <em className="font-bold italic">Register</em> or
                <br />
                <em className="font-bold italic">Sign in</em> now
              </h2>
            </div>

            {/* Privacy policy agreement notice */}
            <p className="text-slate text-sm sm:text-base leading-relaxed max-w-sm">
              By registering you agree to our{" "}
              <Link
                href="/privacy"
                prefetch
                className="underline underline-offset-4 font-medium text-slate hover:text-black"
              >
                Privacy &amp; Policy
              </Link>
              .
            </p>

            {/* Social / Email login buttons (80x80px / rounded-2xl) */}
            <div className="flex items-center gap-5 pt-2">
              <GoogleSignInButton
                iconOnly
                className="size-20 rounded-2xl border-stone/50 hover:border-slate/60 hover:bg-stone/10 transition-colors shadow-xs"
                iconClassName="size-8"
              />
              <Button
                variant="outline"
                size="icon-lg"
                className="size-20 rounded-2xl border-stone/50 hover:border-slate/60 hover:bg-stone/10 transition-colors shadow-xs"
                nativeButton={false}
                render={
                  <Link
                    href="/sign-up"
                    prefetch
                    aria-label="Continue with email"
                  />
                }
              >
                <Mail className="size-8 text-slate" />
              </Button>
            </div>

            {/* Direct helper links */}
            <div className="text-xs text-muted-foreground pt-4 flex items-center gap-4">
              <span>Already registered?</span>
              <Link
                href="/sign-in"
                prefetch
                className="font-bold underline text-slate hover:text-black"
              >
                Sign in directly
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
