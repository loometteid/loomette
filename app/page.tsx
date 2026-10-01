import Image from "next/image";
import Link from "next/link";
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
    answer:
      "Yes! Loomette works across all styles, aesthetics, and silhouettes — from casual streetwear to formal tailoring. Our AI recognizes a wide range of cuts, fabrics, and accessories.",
  },
  {
    question: "How accurate is the AI detection?",
    answer:
      "Very. We're at 98% accuracy across tops, bottoms, shoes, and accessories. And you always get to review before anything is saved.",
  },
  {
    question: "Is my data private? Can other people see my wardrobe?",
    answer:
      "Your wardrobe is completely private to you. We never share or sell your photos, personal style logs, or wardrobe data to third parties.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="flex flex-1 flex-col overflow-x-clip bg-background text-slate"
      data-testid="landing-page"
    >
      {/* Header — 100px desktop height, 64px mobile height with glassmorphism */}
      <header
        className="sticky top-0 z-50 flex h-16 md:h-24 lg:h-28 items-center justify-between bg-[#fafaf7]/85 px-6 md:px-12 lg:px-16 backdrop-blur-md"
        data-testid="landing-page__header"
      >
        <Link
          href="/"
          prefetch
          aria-label="Loomette home"
          data-testid="landing-page__wordmark"
        >
          <Wordmark />
        </Link>

        {/* Center Main Nav (Desktop) */}
        <nav
          aria-label="Main Navigation"
          data-testid="landing-page__nav-desktop"
          className="hidden md:flex items-center gap-8 lg:gap-12 text-sm font-medium tracking-[0.2em] uppercase text-slate"
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
          data-testid="landing-page__nav-auth"
          className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium tracking-[0.15em] uppercase text-slate"
        >
          <Link
            href="/sign-in"
            prefetch
            data-testid="landing-page__sign-in-link"
            className="hover:text-black transition-colors"
          >
            Sign in
          </Link>
          <span className="text-stone/60">|</span>
          <Link
            href="/sign-up"
            prefetch
            data-testid="landing-page__sign-up-link"
            className="hover:text-black transition-colors"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center w-full">
        {/* Section 1: Hero — Fullscreen Viewport (100vh with header) */}
        <section
          className="relative flex w-full min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-6rem)] lg:min-h-[calc(100dvh-7rem)] flex-col items-center justify-center px-6 py-8 md:py-12 text-center overflow-hidden"
          data-testid="landing-page__hero"
        >
          {/* Viewport-scaled Mascots anchored to full screen boundaries */}
          <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden">
            {/* Mascot 1 (image 43): Black clothes hanger with cartoon eyes (Top-Left) */}
            <Image
              src="/brand/mascot-image-43.png"
              alt=""
              width={1536}
              height={1024}
              priority
              data-testid="landing-page__mascot"
              data-entity-id="mascot-43"
              className="pointer-events-none absolute -top-4 sm:-top-6 md:top-0 lg:top-2 -left-10 sm:-left-8 md:-left-12 lg:-left-14 w-52 sm:w-64 md:w-80 lg:w-[28vw] max-w-115 h-auto z-10 select-none"
            />

            {/* Mascot 2 (image 45): White fluffy sprite with cartoon eyes (Top-Right) */}
            <Image
              src="/brand/mascot-image-45.png"
              alt=""
              width={1278}
              height={1230}
              priority
              data-testid="landing-page__mascot"
              data-entity-id="mascot-45"
              className="pointer-events-none absolute top-16 sm:top-20 md:top-10 lg:top-12 right-4 sm:right-8 md:right-[16%] lg:right-[20%] w-14 sm:w-16 md:w-20 lg:w-[6.5vw] max-w-25 h-auto z-10 select-none"
            />

            {/* Mascot 3 (image 44): Black fluffy soot sprite with cartoon eyes (Mid-Left) */}
            <Image
              src="/brand/mascot-image-44.png"
              alt=""
              width={1271}
              height={1237}
              priority
              data-testid="landing-page__mascot"
              data-entity-id="mascot-44"
              className="pointer-events-none absolute bottom-12 sm:bottom-16 md:bottom-20 lg:bottom-24 left-4 sm:left-8 md:left-[14%] lg:left-[18%] w-16 sm:w-20 md:w-24 lg:w-[8vw] max-w-31.25 h-auto z-10 select-none"
            />

            {/* Mascot 4 (image 42): Chrome/silver clothes hanger with cartoon eyes (Mid-Right) */}
            <Image
              src="/brand/mascot-image-42.png"
              alt=""
              width={1536}
              height={1024}
              priority
              data-testid="landing-page__mascot"
              data-entity-id="mascot-42"
              className="pointer-events-none absolute -bottom-6 sm:-bottom-8 md:bottom-0 lg:bottom-2 -right-10 sm:-right-8 md:-right-12 lg:-right-14 w-48 sm:w-60 md:w-90 lg:w-[32vw] max-w-130 h-auto z-10 select-none"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Availability Pill Badge */}
            <div className="inline-flex items-center justify-center rounded-full bg-[#ede8e1] px-4 py-1.5 text-xs md:text-sm font-medium tracking-[0.15em] text-slate uppercase">
              Now available ㆍ free to start
            </div>

            {/* Main Headline — Only 'Wardrobe' is bold italic */}
            <h1
              className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-normal leading-[1.05] tracking-tight text-slate max-w-4xl"
              data-testid="landing-page__hero-title"
            >
              Your <em className="font-bold italic">Wardrobe</em>,
              <br />
              Finally Organized.
            </h1>

            {/* Supporting Subtitle */}
            <p className="max-w-145 text-xs sm:text-sm md:text-base tracking-[0.12em] uppercase text-slate/90 leading-relaxed font-sans px-4">
              Log what you wear, track what you own, and stop asking yourself
              &quot;what do I have?&quot;
            </p>

            {/* Hero CTA Button & Notice */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                variant="default"
                nativeButton={false}
                data-testid="landing-page__hero-cta"
                className="w-full min-w-65 max-w-80 h-14 md:h-16 rounded-2xl text-base md:text-xl font-medium tracking-[0.15em] uppercase shadow-md bg-[#333333] text-white hover:bg-black transition-colors"
                render={<Link href="/sign-up" prefetch />}
              >
                Create Account
              </Button>
              <p className="text-xs sm:text-sm md:text-base text-stone font-medium">
                No credit card required. Free forever.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Everything in one place — Fullscreen Viewport */}
        <section
          className="relative flex w-full min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 md:py-16 text-center"
          data-testid="landing-page__overview"
        >
          {/* Mobile uses image 43 hanger mascot above headline; Desktop uses Sparkle icon */}
          <div className="block md:hidden">
            <Image
              src="/brand/mascot-image-43.png"
              alt=""
              width={72}
              height={48}
              className="w-18 h-auto object-contain select-none"
            />
          </div>
          <div className="hidden md:block">
            <Sparkle className="size-12.5 text-slate" />
          </div>

          <h2
            className="font-serif text-3xl sm:text-5xl md:text-[64px] lg:text-[72px] font-normal leading-tight text-slate whitespace-normal md:whitespace-nowrap"
            data-testid="landing-page__overview-title"
          >
            Everything in <em className="font-bold italic">one place</em>.
          </h2>
          <p className="max-w-180 text-slate text-xs sm:text-sm md:text-base tracking-wider uppercase leading-relaxed">
            Upload once. We&apos;ll identify the pieces, organize them, and help
            you make sense of what you own.
          </p>
          <div
            className="w-full max-w-275 xl:max-w-300 aspect-[2/1] max-h-[55vh] rounded-[20px] bg-[#D9D9D9] border border-stone/20 shadow-inner flex items-center justify-center text-stone/80 font-medium text-sm md:text-base mt-2"
            data-testid="landing-page__overview-preview"
          />
        </section>

        {/* Section 3: Three steps — Fullscreen Viewport */}
        <section
          className="relative flex w-full min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 md:py-16 text-center"
          data-testid="landing-page__steps"
        >
          <Sparkle className="size-8 md:size-12.5 text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] lg:text-[72px] font-normal leading-tight text-slate whitespace-normal md:whitespace-nowrap">
            <em className="font-bold italic">Three steps.</em> That&apos;s it.
          </h2>
          <p className="max-w-180 text-slate text-xs sm:text-sm md:text-base tracking-wider uppercase">
            No manual tagging. No spreadsheets. Just your wardrobe, organized.
          </p>

          {/* Mobile: 3 clean vertical numbered steps without bulky mockups per Figma #773:512 */}
          <div
            className="flex md:hidden flex-col gap-8 w-full max-w-sm pt-4 text-left"
            data-testid="landing-page__steps-mobile"
          >
            <div
              className="flex items-start gap-4"
              data-testid="landing-page__step-item"
              data-entity-id="01"
            >
              <div className="size-8 shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-xs text-slate">
                01
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-base text-slate font-normal">
                  <em className="font-bold italic">Upload a photo</em> of your outfit
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-slate/75 leading-relaxed">
                  Snap it fresh or pull from your gallery. Full outfit works best.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4"
              data-testid="landing-page__step-item"
              data-entity-id="02"
            >
              <div className="size-8 shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-xs text-slate">
                02
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-base text-slate font-normal">
                  <em className="font-bold italic">Review &amp; approve</em> the pieces
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-slate/75 leading-relaxed">
                  We identify tops, bottoms, and accessories so you can verify each item.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4"
              data-testid="landing-page__step-item"
              data-entity-id="03"
            >
              <div className="size-8 shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-xs text-slate">
                03
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-base text-slate font-normal">
                  <em className="font-bold italic">Track &amp; style</em> everyday
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-slate/75 leading-relaxed">
                  Build your lookbook, see wear stats, and mix &amp; match effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop: Alternating text and real phone mockup per Figma #643:966 */}
          <div
            className="hidden md:flex w-full max-w-300 flex-col gap-16 lg:gap-24 pt-10"
            data-testid="landing-page__steps-desktop"
          >
            {/* Step 1: Text left / Phone right */}
            <div
              className="flex items-center justify-between gap-12 lg:gap-16"
              data-testid="landing-page__step-item"
              data-entity-id="01"
            >
              <div className="flex items-start gap-8 lg:gap-10 max-w-xl text-left">
                <div className="size-20 lg:size-25 shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-3xl lg:text-4xl text-slate font-normal">
                  01
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-3xl lg:text-4xl text-slate font-normal">
                    <em className="font-bold italic">Upload a photo</em> of your
                    outfit
                  </h3>
                  <p className="text-slate/80 text-base lg:text-xl leading-relaxed">
                    Snap it fresh or pull from your gallery. Full outfit works
                    best.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-center">
                <Image
                  src="/brand/phone-mockup.png"
                  alt="Loomette outfit capture screen"
                  width={294}
                  height={533}
                  className="w-65 lg:w-73.5 h-auto drop-shadow-md select-none"
                />
              </div>
            </div>

            {/* Step 2: Phone left / Text right */}
            <div
              className="flex items-center justify-between gap-12 lg:gap-16"
              data-testid="landing-page__step-item"
              data-entity-id="02"
            >
              <div className="shrink-0 flex items-center justify-center">
                <Image
                  src="/brand/phone-mockup.png"
                  alt="Loomette piece recognition screen"
                  width={294}
                  height={533}
                  className="w-65 lg:w-73.5 h-auto drop-shadow-md select-none"
                />
              </div>
              <div className="flex items-start gap-8 lg:gap-10 max-w-xl text-left">
                <div className="size-20 lg:size-25 shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-3xl lg:text-4xl text-slate font-normal">
                  02
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-3xl lg:text-4xl text-slate font-normal">
                    <em className="font-bold italic">Review &amp; approve</em> the
                    pieces
                  </h3>
                  <p className="text-slate/80 text-base lg:text-xl leading-relaxed">
                    We identify tops, bottoms, and accessories so you can verify
                    each item.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Text left / Phone right */}
            <div
              className="flex items-center justify-between gap-12 lg:gap-16"
              data-testid="landing-page__step-item"
              data-entity-id="03"
            >
              <div className="flex items-start gap-8 lg:gap-10 max-w-xl text-left">
                <div className="size-20 lg:size-25 shrink-0 rounded-full border border-stone/60 flex items-center justify-center font-serif text-3xl lg:text-4xl text-slate font-normal">
                  03
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-serif text-3xl lg:text-4xl text-slate font-normal">
                    <em className="font-bold italic">Track &amp; style</em>{" "}
                    everyday
                  </h3>
                  <p className="text-slate/80 text-base lg:text-xl leading-relaxed">
                    Build your lookbook, see wear stats, and mix &amp; match
                    effortlessly.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-center">
                <Image
                  src="/brand/phone-mockup.png"
                  alt="Loomette wardrobe styling screen"
                  width={294}
                  height={533}
                  className="w-65 lg:w-73.5 h-auto drop-shadow-md select-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: By the numbers — Fullscreen Viewport */}
        <section
          className="relative flex w-full min-h-screen flex-col items-center justify-center gap-8 px-6 py-12 md:py-16 text-center"
          data-testid="landing-page__stats"
        >
          <p className="text-slate text-xs md:text-sm font-medium uppercase tracking-[0.2em]">
            By the numbers
          </p>
          <div className="grid w-full max-w-300 grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center pt-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2"
                data-testid="landing-page__stat-item"
                data-entity-id={stat.label}
              >
                <span
                  className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold italic text-slate leading-none"
                  data-testid="landing-page__stat-value"
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs sm:text-sm md:text-base uppercase tracking-wider text-slate/80 font-normal"
                  data-testid="landing-page__stat-label"
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Honest Review — Fullscreen Viewport */}
        <section
          className="relative flex w-full min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 md:py-16 text-center"
          data-testid="landing-page__reviews"
        >
          <Sparkle className="size-8 md:size-12.5 text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] lg:text-[72px] font-normal leading-tight text-slate">
            <em className="font-bold italic">Honest Review</em> from real users.
          </h2>
          <div className="grid w-full max-w-300 grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            {testimonials.map((t, i) => (
              <Card
                key={i}
                data-testid="landing-page__review-card"
                data-entity-id={t.name}
                className="min-h-45 md:h-57 rounded-[20px] border border-stone/40 bg-white/70 backdrop-blur-xs p-6 md:p-7 flex flex-col justify-between shadow-xs"
              >
                <p className="text-sm md:text-base text-slate leading-relaxed">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4">
                  <div className="size-11 md:size-12 rounded-full bg-[#D9D9D9] shrink-0" />
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

        {/* Section 6: FAQ — Fullscreen Viewport */}
        <section
          className="relative flex w-full min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 md:py-16 text-center"
          data-testid="landing-page__faq"
        >
          <Sparkle className="size-8 md:size-12.5 text-slate" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] lg:text-[72px] font-normal text-slate">
            <em className="font-bold italic">FAQ</em>
          </h2>
          <Accordion
            defaultValue={[]}
            data-testid="landing-page__faq-accordion"
            className="w-full max-w-300 text-left divide-y divide-stone/40 border-y border-stone/40 mt-4"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={i}
                className="py-2 border-none"
                data-testid="landing-page__faq-item"
                data-entity-id={i}
              >
                <AccordionTrigger
                  className="text-base sm:text-xl md:text-2xl text-slate font-medium hover:text-black py-4"
                  data-testid="landing-page__faq-trigger"
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionPanel
                  className="text-sm sm:text-base md:text-lg text-slate/90 leading-relaxed pb-6 max-w-3xl"
                  data-testid="landing-page__faq-panel"
                >
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Section 7: Final CTA & Footer — Fullscreen Viewport together */}
        <section
          className="relative flex w-full min-h-screen flex-col justify-between items-center text-center overflow-hidden"
          data-testid="landing-page__final-cta-section"
        >
          <div
            className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12"
            data-testid="landing-page__final-cta"
          >
            <Sparkle className="size-8 md:size-12.5 text-slate" />
            <h2 className="font-serif text-3xl sm:text-5xl md:text-[64px] lg:text-[72px] font-normal leading-tight text-slate">
              <em className="font-bold italic">Your wardrobe is</em>
              <br />
              <em className="font-bold italic">waiting.</em>
            </h2>
            <p className="text-slate text-xs sm:text-sm md:text-base tracking-[0.15em] uppercase">
              Start for free. No credit card. No setup.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                variant="default"
                nativeButton={false}
                data-testid="landing-page__final-cta-button"
                className="w-full min-w-65 max-w-80 h-14 md:h-16 rounded-2xl text-base md:text-xl font-medium tracking-[0.15em] uppercase shadow-md bg-[#333333] text-white hover:bg-black transition-colors"
                render={<Link href="/sign-up" prefetch />}
              >
                Create Account
              </Button>
              <p className="text-xs sm:text-sm md:text-base text-stone font-normal">
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
          </div>

          {/* Footer — Docked at the bottom of the final fullscreen screen */}
          <footer
            className="relative flex w-full flex-col justify-between overflow-hidden px-6 md:px-12 lg:px-16 py-8 md:py-12 min-h-40 md:h-65 bg-slate/5"
            data-testid="landing-page__footer"
          >
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
              className="pointer-events-none absolute -top-8 -right-8 md:-top-16 md:-right-16 w-36 sm:w-44 md:w-75 h-auto opacity-80 select-none"
            />

            <div className="relative z-10 flex items-center">
              <Wordmark
                className="text-slate text-2xl md:text-3xl"
                iconClassName="size-8 md:size-9"
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 md:pt-8">
              <span className="text-xs md:text-sm text-slate tracking-wide uppercase">
                © 2026 LOOMETTE. ALL RIGHTS RESERVED.
              </span>
              <span className="text-xs md:text-lg font-normal text-slate tracking-[0.2em] uppercase">
                Made with love.
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
