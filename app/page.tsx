import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkle } from "@/components/ui/sparkle";
import { cn } from "@/lib/utils";

function Wordmark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Sparkle className={cn("size-6 text-slate shrink-0", iconClassName)} />
      <span className="font-sans text-2xl font-normal lowercase tracking-tight text-slate">
        loomette
      </span>
    </span>
  );
}

const stats = [
  { value: "12k+", label: "Wardrobes organized" },
  { value: "340k+", label: "Outfit looks logged" },
  { value: "98%", label: "AI detection accuracy" },
  { value: "4.8", label: "Average rating" },
];

const testimonials = [
  {
    quote:
      "I finally stopped buying the same white shirt I already own three of.",
    name: "Koral, 26",
    role: "Designer · Jakarta",
  },
  {
    quote:
      "The AI detection is actually good. It got my whole outfit right on the first try.",
    name: "Kona, 24",
    role: "Marketing · Bandung",
  },
  {
    quote:
      "Didn't think I'd use it every day. But here I am, logging my third look this week.",
    name: "Quqi, 22",
    role: "Student · Surabaya",
  },
];

const faqs = [
  {
    question: "Does it work for any style of clothing?",
    answer: "Content coming soon.",
  },
  {
    question: "How accurate is the AI detection?",
    answer:
      "Very. We're at 98% accuracy across tops, bottoms, shoes, and accessories. And you always get to review before anything is saved.",
  },
  {
    question: "Is my data private? Can other people see my wardrobe?",
    answer: "Content coming soon.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip bg-background">
      {/* Header — 120px desktop height with center main navigation & right auth links */}
      <header className="sticky top-0 z-50 flex h-20 md:h-[120px] items-center justify-between bg-white/10 px-6 md:px-16 backdrop-blur-md">
        <Link href="/" prefetch aria-label="Loomette home">
          <Wordmark />
        </Link>

        {/* Center Main Nav */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-10 text-sm font-medium tracking-widest uppercase text-slate"
        >
          <Link
            href="/home"
            prefetch
            className="hover:text-black transition-colors"
          >
            Home
          </Link>
          <Link
            href="/calendar"
            prefetch
            className="hover:text-black transition-colors"
          >
            Calendar
          </Link>
          <Link
            href="/wardrobe"
            prefetch
            className="hover:text-black transition-colors"
          >
            Wardrobe
          </Link>
        </nav>

        {/* Right Authentication Navigation */}
        <nav
          aria-label="Account Navigation"
          className="flex items-center gap-3 text-xs md:text-sm font-medium tracking-wide uppercase text-slate"
        >
          <Link
            href="/sign-in"
            prefetch
            className="hover:text-black transition-colors"
          >
            Sign in
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/sign-up"
            prefetch
            className="hover:text-black transition-colors"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative flex w-full flex-col items-center px-6 pt-12 pb-20 md:pb-36 text-center overflow-hidden">
          {/* Black Asterisk Ornament */}
          <Image
            src="/brand/asterisk-black.png"
            alt=""
            width={529}
            height={529}
            priority
            className="pointer-events-none absolute top-0 left-0 -z-10 w-44 md:w-[480px] lg:w-[529px] h-auto -translate-x-1/4 -translate-y-1/4 opacity-90"
          />

          {/* Silver Asterisk Ornament */}
          <Image
            src="/brand/asterisk-silver.png"
            alt=""
            width={543}
            height={543}
            priority
            className="pointer-events-none absolute top-10 right-0 -z-10 w-40 md:w-[490px] lg:w-[543px] h-auto translate-x-1/4 -translate-y-1/4 opacity-90"
          />

          <div className="relative z-10 flex flex-col items-center gap-6 pt-12 md:pt-20">
            {/* Availability Pill Badge */}
            <div className="inline-flex items-center justify-center rounded-full bg-[#f7d4de]/80 px-4 py-1.5 text-xs md:text-sm font-medium tracking-wider text-slate uppercase">
              Now available ㆍ free to start
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-[88px] font-normal leading-[1.05] tracking-tight text-slate max-w-4xl">
              Your <em className="font-bold italic">Wardrobe</em>,
              <br />
              Finally Organized.
            </h1>

            {/* Supporting Subtitle */}
            <p className="max-w-[568px] text-xs sm:text-sm md:text-base tracking-wider uppercase text-slate/90 leading-relaxed font-sans">
              Log what you wear, track what you own, and stop asking yourself
              &quot;what do I have?&quot;
            </p>

            {/* Hero CTA Button & Notice */}
            <div className="flex flex-col items-center gap-3 pt-3">
              <Button
                variant="default"
                nativeButton={false}
                className="w-full max-w-[320px] h-16 rounded-2xl text-lg md:text-xl font-medium tracking-wider uppercase shadow-md bg-slate text-white hover:bg-slate/90"
                render={<Link href="/sign-up" prefetch />}
              >
                Create Account
              </Button>
              <p className="text-sm md:text-base text-stone font-medium">
                No credit card required. Free forever.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Everything in one place */}
        <section className="relative flex w-full flex-col items-center gap-6 px-6 py-20 md:py-28 text-center">
          <Sparkle className="size-8 md:size-[50px] text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] font-normal leading-tight text-slate whitespace-normal md:whitespace-nowrap">
            Everything in <em className="font-bold italic">one place</em>.
          </h2>
          <p className="max-w-[720px] text-slate text-sm sm:text-base md:text-lg leading-relaxed">
            Upload once. We&apos;ll identify the pieces, organize them, and help
            you make sense of what you own.
          </p>
          <div className="w-full max-w-[1200px] aspect-[2/1] rounded-[20px] bg-[#D9D9D9] border border-stone/20 shadow-inner flex items-center justify-center text-stone font-medium text-sm md:text-base mt-2" />
        </section>

        {/* Section: Three steps */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-20 md:py-28 text-center">
          <Sparkle className="size-8 md:size-[50px] text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] font-normal leading-tight text-slate whitespace-normal md:whitespace-nowrap">
            <em className="font-bold italic">Three steps.</em> That&apos;s it.
          </h2>
          <p className="max-w-[720px] text-slate text-sm sm:text-base md:text-lg">
            No manual tagging. No spreadsheets. Just your wardrobe, organized.
          </p>

          <div className="w-full max-w-[1200px] flex flex-col gap-16 md:gap-24 pt-10">
            {/* Step 1: Text left / Phone right */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
              <div className="flex items-start gap-6 md:gap-10 max-w-xl text-left">
                <div className="size-16 md:size-[100px] shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-2xl md:text-4xl text-slate font-normal">
                  01
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-2xl md:text-4xl text-slate font-normal">
                    <em className="font-bold italic">Upload a photo</em> of your
                    outfit
                  </h3>
                  <p className="text-slate/80 text-sm md:text-lg leading-relaxed">
                    Snap it fresh or pull from your gallery. Full outfit works
                    best.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-[294px] h-[460px] md:h-[533px] rounded-[36px] border-[6px] border-slate/10 bg-[#f5f2ed] shadow-lg flex flex-col items-center justify-center p-6 text-center text-stone">
                <div className="size-16 rounded-full bg-slate/10 flex items-center justify-center mb-4">
                  <Sparkle className="size-8 text-slate/50" />
                </div>
                <span className="text-xs uppercase tracking-wider text-slate/60 font-medium">
                  Outfit Camera / Upload
                </span>
              </div>
            </div>

            {/* Step 2: Phone left / Text right */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-16">
              <div className="w-full max-w-[294px] h-[460px] md:h-[533px] rounded-[36px] border-[6px] border-slate/10 bg-[#f5f2ed] shadow-lg flex flex-col items-center justify-center p-6 text-center text-stone">
                <div className="size-16 rounded-full bg-slate/10 flex items-center justify-center mb-4">
                  <Sparkle className="size-8 text-slate/50" />
                </div>
                <span className="text-xs uppercase tracking-wider text-slate/60 font-medium">
                  Item Recognition
                </span>
              </div>
              <div className="flex items-start gap-6 md:gap-10 max-w-xl text-left">
                <div className="size-16 md:size-[100px] shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-2xl md:text-4xl text-slate font-normal">
                  02
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-2xl md:text-4xl text-slate font-normal">
                    <em className="font-bold italic">Review &amp; approve</em> the
                    pieces
                  </h3>
                  <p className="text-slate/80 text-sm md:text-lg leading-relaxed">
                    We identify tops, bottoms, and accessories so you can verify
                    each item.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Text left / Phone right */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
              <div className="flex items-start gap-6 md:gap-10 max-w-xl text-left">
                <div className="size-16 md:size-[100px] shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-2xl md:text-4xl text-slate font-normal">
                  03
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-2xl md:text-4xl text-slate font-normal">
                    <em className="font-bold italic">Track &amp; style</em>{" "}
                    everyday
                  </h3>
                  <p className="text-slate/80 text-sm md:text-lg leading-relaxed">
                    Build your lookbook, see wear stats, and mix &amp; match
                    effortlessly.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-[294px] h-[460px] md:h-[533px] rounded-[36px] border-[6px] border-slate/10 bg-[#f5f2ed] shadow-lg flex flex-col items-center justify-center p-6 text-center text-stone">
                <div className="size-16 rounded-full bg-slate/10 flex items-center justify-center mb-4">
                  <Sparkle className="size-8 text-slate/50" />
                </div>
                <span className="text-xs uppercase tracking-wider text-slate/60 font-medium">
                  Mix &amp; Match Styling
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: By the numbers (Stats) */}
        <section className="flex w-full flex-col items-center gap-8 px-6 py-20 md:py-28 bg-[#fafaf7]/50">
          <p className="text-slate text-sm md:text-lg font-medium uppercase tracking-wider">
            By the numbers
          </p>
          <div className="grid w-full max-w-[1200px] grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center pt-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2"
              >
                <span className="font-serif text-4xl sm:text-6xl md:text-[80px] font-bold italic text-slate leading-none">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm md:text-lg text-slate/80 font-normal">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Honest Review */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-20 md:py-28 text-center">
          <Sparkle className="size-8 md:size-[50px] text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] font-normal leading-tight text-slate">
            <em className="font-bold italic">Honest Review</em> from real users.
          </h2>
          <div className="grid w-full max-w-[1200px] grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            {testimonials.map((t, i) => (
              <Card
                key={i}
                className="h-auto md:h-[228px] rounded-2xl border border-stone/40 bg-white/70 backdrop-blur-xs p-6 flex flex-col justify-between shadow-xs"
              >
                <p className="text-sm md:text-base text-slate leading-relaxed">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4">
                  <Avatar className="size-11 border border-stone/30 bg-[#e5e0d8]">
                    <AvatarFallback className="bg-stone/30 text-slate text-xs font-semibold">
                      {t.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate">
                      {t.name}
                    </span>
                    <span className="text-xs text-stone">{t.role}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section: FAQ */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-20 md:py-28 text-center">
          <Sparkle className="size-8 md:size-[50px] text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] font-normal text-slate">
            <em className="font-bold italic">FAQ</em>
          </h2>
          <Accordion
            defaultValue={[1]}
            className="w-full max-w-[1200px] text-left divide-y divide-stone/40 border-y border-stone/40 mt-4"
          >
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={i} className="py-2 border-none">
                <AccordionTrigger className="text-base sm:text-xl md:text-2xl text-slate font-medium hover:text-black py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionPanel className="text-sm sm:text-base md:text-lg text-slate/90 leading-relaxed pb-6 max-w-3xl">
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Section: Final CTA */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-20 md:py-28 text-center">
          <Sparkle className="size-8 md:size-[50px] text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] font-normal leading-tight text-slate">
            <em className="font-bold italic">Your wardrobe is</em>
            <br />
            <em className="font-bold italic">waiting.</em>
          </h2>
          <p className="text-slate text-sm sm:text-base md:text-lg">
            Start for free. No credit card. No setup.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button
              variant="default"
              nativeButton={false}
              className="w-full max-w-[320px] h-16 rounded-2xl text-lg md:text-xl font-medium tracking-wider uppercase shadow-md bg-slate text-white hover:bg-slate/90"
              render={<Link href="/sign-up" prefetch />}
            >
              Create Account
            </Button>
            <p className="text-sm md:text-base text-stone font-normal">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                prefetch
                className="font-bold underline text-slate hover:text-black ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* Footer — 303px desktop height with sky background & silver asterisk */}
      <footer className="relative flex w-full flex-col justify-between overflow-hidden px-6 md:px-16 py-10 md:py-14 min-h-[220px] md:h-[303px] bg-slate/5">
        <Image
          src="/brand/sky.png"
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none object-cover object-bottom -z-10 opacity-75"
        />
        <Image
          src="/brand/asterisk-silver.png"
          alt=""
          width={344}
          height={344}
          className="pointer-events-none absolute -top-10 -right-10 md:-top-20 md:-right-16 w-48 md:w-[344px] h-auto opacity-80"
        />

        <div className="relative z-10 flex items-center">
          <Wordmark
            className="text-slate text-2xl md:text-3xl"
            iconClassName="size-8 md:size-9"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8">
          <span className="text-xs md:text-sm text-slate tracking-wide">
            © 2026 Closet. All rights reserved.
          </span>
          <span className="text-sm md:text-xl font-normal text-slate tracking-widest uppercase">
            Made with love.
          </span>
        </div>
      </footer>
    </div>
  );
}
