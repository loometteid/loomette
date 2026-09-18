import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
      <circle cx="24" cy="24" r="24" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M28.5 25.5 29.3 20H24v-3.5c0-1.6.8-3.1 3.1-3.1h2.4V8.7s-2.2-.4-4.3-.4c-4.3 0-7.2 2.6-7.2 7.5V20h-4.8v5.5H18V40h6V25.5h4.5Z"
      />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="size-10" aria-hidden>
      <rect width="40" height="40" rx="8" fill="#000000" />
      <path
        fill="#FFFFFF"
        transform="translate(8 8)"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.601-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.293 19.493h2.039L6.486 3.24H4.298l13.31 17.406Z"
      />
    </svg>
  );
}

function AuthProviderButtons() {
  return (
    <div className="flex items-center gap-4">
      <GoogleSignInButton iconOnly />

      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        disabled
        aria-label="Facebook sign-in is coming soon"
        title="Facebook sign-in is coming soon"
        className="size-16 rounded-2xl border-[#C9C3B7] bg-background disabled:opacity-100"
      >
        <FacebookGlyph />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        disabled
        aria-label="X sign-in is coming soon"
        title="X sign-in is coming soon"
        className="size-16 rounded-2xl border-[#C9C3B7] bg-background disabled:opacity-100"
      >
        <XGlyph />
      </Button>

      <Button
        variant="outline"
        size="icon-lg"
        className="size-16 rounded-2xl border-[#C9C3B7]"
        nativeButton={false}
        render={<Link href="/sign-up" aria-label="Continue with email" />}
      >
        <Mail className="size-6" />
      </Button>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip lg:grid lg:h-dvh lg:min-h-[640px] lg:grid-cols-[57.2916667%_42.7083333%] lg:overflow-hidden">
      {/* Mobile keeps the existing approved composition unchanged. */}
      <div className="relative w-full lg:hidden">
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

      <div className="flex flex-col items-center gap-6 px-6 pt-20 pb-12 text-center lg:hidden">
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

        <AuthProviderButtons />
      </div>

      {/* Desktop follows the 1440 × 1024 D0.1 Register/Sign in frame.
          The exported left panel already contains the exact cloud crop
          and both large asterisk ornaments from Figma. */}
      <section className="relative hidden h-dvh min-h-[640px] overflow-hidden lg:block">
        <Image
          src="/brand/welcome-desktop-panel.svg"
          alt=""
          fill
          priority
          sizes="57.2916667vw"
          unoptimized
          className="object-cover"
        />

        <div className="absolute top-[84px] left-[80px] flex flex-col gap-4">
          <Typography
            variant="mega-title"
            className="text-[64px] leading-[1.25] text-white"
          >
            Your
            <br />
            <span className="font-bold underline underline-offset-[6px]">
              wardrobe.
            </span>
            <br />
            Finally,
            <br />
            <span className="font-bold">organized.</span>
          </Typography>
          <Typography
            variant="subtitle"
            className="text-left text-[12px] leading-normal text-white"
          >
            Addresses the pain, promises the fix.
          </Typography>
        </div>
      </section>

      <section className="relative hidden h-dvh min-h-[640px] items-center overflow-hidden bg-background px-[90px] lg:flex">
        <div className="w-full max-w-[435px]">
          <div className="flex items-start gap-[22px]">
            <Image
              src="/brand/auth-sparkle.svg"
              alt=""
              width={64}
              height={64}
              className="mt-1 size-16 shrink-0"
            />
            <Typography
              variant="title"
              as="h1"
              className="text-[64px] leading-[1.25] whitespace-nowrap"
            >
              <em className="font-bold italic">Register</em> or
              <br />
              <em className="font-bold italic">Sign in</em> now
            </Typography>
          </div>

          <Typography
            variant="subtitle"
            className="mt-6 ml-[86px] text-left text-[12px] leading-[1.6] text-foreground"
          >
            <span className="block whitespace-nowrap">
              By registering you are agree to our
            </span>
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy &amp; Policy
            </Link>
          </Typography>

          <div className="mt-12 ml-[86px]">
            <AuthProviderButtons />
          </div>
        </div>
      </section>
    </main>
  );
}
