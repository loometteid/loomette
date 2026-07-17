import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      {/* Hero — sky.png already has its organic blob shape and the
          silver corner asterisk baked in. Only the headline is
          overlaid here; the two extra black asterisks below are the
          same public/brand/asterisk-black.png used on the Landing
          Page, not new art. */}
      <div className="relative w-full">
        <Image
          src="/brand/sky.png"
          alt=""
          width={402}
          height={511}
          priority
          className="h-auto w-full"
        />

        <div className="absolute top-[44%] right-0 left-0 flex flex-col gap-3 px-6">
          <Typography variant="mega-title" className="text-white">
            Your <em className="font-bold underline">wardrobe</em>.
            <br />
            Finally, <em className="font-bold">organized</em>.
          </Typography>
          <Typography variant="subtitle" className="text-white/90">
            Addresses the pain, promises the fix.
          </Typography>
        </div>

        <Image
          src="/brand/asterisk-black.png"
          alt=""
          width={218}
          height={270}
          className="pointer-events-none absolute bottom-6 left-0 w-14 -translate-x-1/3"
        />
        <Image
          src="/brand/asterisk-black.png"
          alt=""
          width={218}
          height={270}
          className="pointer-events-none absolute -bottom-14 right-8 w-24"
        />
      </div>

      <div className="flex flex-col items-center gap-6 px-6 pt-20 pb-12 text-center">
        <div className="flex flex-col items-center gap-1">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title">
            <em className="font-bold italic">Register</em> or
            <br />
            <em className="font-bold italic">Sign in</em> now
          </Typography>
        </div>

        <Typography variant="subtitle" className="max-w-xs">
          By registering you agree to our{" "}
          <Link href="/privacy" className="underline">
            Privacy &amp; Policy
          </Link>
          .
        </Typography>

        {/* Founder scope: "login only can email and gmail" — Facebook
            and X dropped entirely, Google kept as real OAuth, email
            added as a founder-directed deviation (no email icon
            exists in the Figma reference). */}
        <div className="flex items-center gap-4">
          <GoogleSignInButton iconOnly />
          <Button
            variant="outline"
            size="icon-lg"
            className="size-16 rounded-2xl"
            nativeButton={false}
            render={<Link href="/sign-up" aria-label="Continue with email" />}
          >
            <Mail className="size-6" />
          </Button>
        </div>
      </div>
    </main>
  );
}
