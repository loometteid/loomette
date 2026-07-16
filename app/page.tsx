import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Typography } from "@/components/ui/typography";

// Loomette's 8-point sparkle mark — recurs as the logo glyph and as a
// section divider throughout the Landing Page. See figma/onboarding/.
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

function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <Sparkle className="size-4" />
      <span className="font-serif text-xl">loomette</span>
    </span>
  );
}

const steps = [
  {
    title: "Upload a photo",
    rest: " of your outfit",
    description:
      "Snap it fresh or pull from your gallery. Full outfit works best.",
  },
  {
    title: "Upload a photo",
    rest: " of your outfit",
    description:
      "Snap it fresh or pull from your gallery. Full outfit works best.",
  },
  {
    title: "Upload a photo",
    rest: " of your outfit",
    description:
      "Snap it fresh or pull from your gallery. Full outfit works best.",
  },
];

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
    name: "Koral, 26",
    role: "Designer · Jakarta",
  },
  {
    quote:
      "Didn't think I'd use it every day. But here I am, logging my third look this week.",
    name: "Koral, 26",
    role: "Designer · Jakarta",
  },
];

const faqs = [
  {
    question: "Does it work for any style of clothing?",
    // No answer text exists in the Figma reference for this question —
    // placeholder pending real copy.
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
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="flex items-center justify-between px-6 py-6">
        <Wordmark />
        <nav className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
          <Link href="/welcome">Sign in</Link>
          <span className="text-border">|</span>
          <Link href="/welcome">Sign up</Link>
        </nav>
      </header>

      <main className="flex flex-col items-center">
        {/* Hero */}
        <section className="relative flex w-full flex-col items-center px-6 pt-8 pb-16 text-center">
          <Image
            src="/brand/asterisk-black.png"
            alt=""
            width={218}
            height={270}
            className="pointer-events-none absolute top-0 left-0 -z-10 w-40 -translate-x-1/4 -translate-y-1/4"
          />
          <div className="relative z-10 flex flex-col items-center gap-6 pt-24">
            <Badge>Now available · Free to start</Badge>
            <Typography variant="mega-title">
              Your <em className="font-bold italic">Wardrobe</em>,
              <br />
              Finally Organized.
            </Typography>
            <Typography variant="subtitle" className="max-w-xs">
              Log what you wear, track what you own, and stop asking yourself
              &quot;what do I have?&quot;
            </Typography>
            <Button
              variant="default"
              nativeButton={false}
              render={<Link href="/welcome" />}
            >
              Create Account
            </Button>
          </div>
        </section>

        {/* Everything in one place */}
        <section className="relative flex w-full flex-col items-center gap-6 px-6 py-16 text-center">
          <Image
            src="/brand/asterisk-silver.png"
            alt=""
            width={205}
            height={309}
            className="pointer-events-none absolute top-0 right-0 -z-10 w-32 translate-x-1/4 -translate-y-1/2"
          />
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title">
            Everything in
            <br />
            <em className="font-bold italic">one place</em>.
          </Typography>
          <div className="h-48 w-full max-w-md rounded-2xl bg-gray-200" />
          <Typography variant="subtitle" className="max-w-sm">
            Upload once. We&apos;ll identify the pieces, organize them, and help
            you make sense of what you own.
          </Typography>
        </section>

        {/* Three steps */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-16 text-center">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title">
            <em className="font-bold italic">Three steps.</em>
            <br />
            That&apos;s it.
          </Typography>
          <Typography variant="subtitle" className="max-w-sm">
            No manual tagging. No spreadsheets. Just your wardrobe, organized.
          </Typography>
          <ol className="flex w-full max-w-sm flex-col gap-8 pt-4 text-left">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                  01
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-serif text-base">
                    <em className="italic font-bold">{step.title}</em>
                    {step.rest}
                  </p>
                  <Typography variant="subtitle" as="p">
                    {step.description}
                  </Typography>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Stats */}
        <section className="flex w-full flex-col items-center gap-8 px-6 py-16">
          <Typography variant="subtitle">By the numbers</Typography>
          <div className="grid w-full max-w-sm grid-cols-2 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-serif text-3xl font-bold italic">
                  {stat.value}
                </span>
                <Typography variant="subtitle" as="span">
                  {stat.label}
                </Typography>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-16 text-center">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title">
            <em className="italic font-bold">Honest Review</em>
            <br />
            from real users.
          </Typography>
          <div className="flex w-full max-w-sm flex-col gap-4 pt-4 text-left">
            {testimonials.map((t, i) => (
              <Card
                key={i}
                className="rounded-2xl border border-border bg-background py-6"
              >
                <div className="flex flex-col gap-4 px-6">
                  <p className="text-sm">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.role}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-16 text-center">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title">
            <em className="italic font-bold">FAQ</em>
          </Typography>
          <Accordion defaultValue={[1]} className="w-full max-w-sm text-left">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={i}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionPanel>{faq.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA */}
        <section className="flex w-full flex-col items-center gap-6 px-6 py-16 text-center">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="mega-title">
            <em className="italic font-bold">Your wardrobe is</em>
            <br />
            <em className="italic font-bold">waiting.</em>
          </Typography>
          <Typography variant="subtitle">
            Start for free. No credit card. No setup.
          </Typography>
          <Button
            variant="default"
            nativeButton={false}
            render={<Link href="/welcome" />}
          >
            Create Account
          </Button>
          <Typography variant="subtitle" className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/welcome" className="font-bold underline">
              Sign in
            </Link>
          </Typography>
        </section>
      </main>

      <footer className="relative flex w-full flex-col justify-end gap-2 overflow-hidden bg-stone px-6 py-8">
        <Image
          src="/brand/asterisk-silver.png"
          alt=""
          width={205}
          height={309}
          className="pointer-events-none absolute top-0 right-0 w-40 opacity-80"
        />
        <Wordmark className="relative z-10 text-foreground" />
        <span className="relative z-10 text-xs text-foreground/70">
          © 2026 Loomette. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
