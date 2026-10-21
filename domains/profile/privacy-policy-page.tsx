"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { ProfileBreadcrumb } from "./components/profile-breadcrumb";

interface TocItem {
  id: string;
  navTitle: string;
  number: string;
  title: string;
}

const SECTIONS: readonly TocItem[] = [
  {
    id: "section-01",
    navTitle: "01. What We Collect",
    number: "01",
    title: "What we collect",
  },
  {
    id: "section-02",
    navTitle: "02. How We Use It",
    number: "02",
    title: "How we use it",
  },
  {
    id: "section-03",
    navTitle: "03. What We Don't Do",
    number: "03",
    title: "What we don't do",
  },
  {
    id: "section-04",
    navTitle: "04. Third-Party Service",
    number: "04",
    title: "Third-party services",
  },
  {
    id: "section-05",
    navTitle: "05. Your Rights",
    number: "05",
    title: "Your rights",
  },
  {
    id: "section-06",
    navTitle: "06. How We Keep It Safe",
    number: "06",
    title: "How we keep it safe",
  },
  {
    id: "section-07",
    navTitle: "07. Under 13",
    number: "07",
    title: "Under 13",
  },
  {
    id: "section-08",
    navTitle: "08. When This Policy Changes",
    number: "08",
    title: "When this policy changes",
  },
] as const;

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 flex flex-col gap-3">
      <span className="font-sans text-xs font-normal text-muted-foreground">
        {number}
      </span>
      <Typography
        variant="h1"
        as="h2"
        className="font-serif text-lg md:text-xl font-normal text-foreground"
      >
        {title}
      </Typography>
      <div className="flex flex-col gap-3 font-sans text-xs md:text-sm font-normal text-foreground/90 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SectionDivider() {
  return (
    <div
      role="separator"
      className="hidden lg:block h-px w-full bg-[#EAE4DC] dark:bg-border my-8"
    />
  );
}

export function PrivacyPolicyView() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("section-01");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb (desktop) */}
      <ProfileBreadcrumb
        items={[
          { label: "PROFILE", href: "/profile" },
          { label: "SETTINGS", href: "/profile/settings" },
          { label: "PRIVACY & POLICY" },
        ]}
      />

      {/* Mobile back button */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          data-testid="privacy-policy__back-button"
          className="size-10 rounded-xl bg-[#F2EDE5] text-[#383733] hover:bg-[#EAE4DC] dark:bg-muted dark:text-foreground"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>

      {/* Header title */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Sparkle className="size-6 text-foreground" />
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] md:text-4xl lg:text-[44px] font-normal leading-tight text-foreground"
          >
            Privacy & Policy
          </Typography>
        </div>
        <Typography
          variant="subtitle"
          className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground"
        >
          LAST UPDATE: JUNE 2026
        </Typography>
      </div>

      {/* Main Responsive Layout */}
      <div className="flex flex-col lg:flex-row lg:gap-16 pt-2">
        {/* Left Sticky Navigation (desktop only, D.4.5.1) */}
        <nav
          aria-label="Privacy policy sections"
          data-testid="privacy-policy__toc"
          className="hidden lg:flex flex-col gap-2 w-64 shrink-0 sticky top-28 h-fit"
        >
          {SECTIONS.map(({ id, navTitle }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                data-testid={`privacy-policy__toc-item-${id}`}
                onClick={() => scrollToSection(id)}
                className={cn(
                  "text-left px-5 py-3 rounded-2xl font-sans text-sm font-normal transition-colors",
                  isActive
                    ? "bg-[#F2EDE5] text-[#383733] font-medium dark:bg-muted dark:text-foreground"
                    : "text-[#7A7870] hover:text-foreground hover:bg-[#F2EDE5]/40 dark:text-muted-foreground",
                )}
              >
                {navTitle}
              </button>
            );
          })}
        </nav>

        {/* Right Content Sections */}
        <div className="flex flex-1 flex-col max-w-3xl gap-8 lg:gap-0">
          <Section
            id="section-01"
            number="01"
            title="What we collect"
          >
            <p>To make the app work for you, we collect the following:</p>
            <ul className="flex flex-col gap-2 pl-5 [list-style-type:disc]">
              <li>
                <strong>Account info</strong> — your name, email address, and
                password (encrypted).
              </li>
              <li>
                <strong>Profile details</strong> — birthday, gender, profession,
                and style preferences, if you choose to add them. All optional.
              </li>
              <li>
                <strong>Body measurements</strong> — height, weight, outfit
                size, and shoe size. Only stored to improve suggestions. Never
                shown to other users.
              </li>
              <li>
                <strong>Outfit photos & data</strong> — photos you upload,
                outfit logs, and calendar entries.
              </li>
              <li>
                <strong>Usage data</strong> — how you interact with the app,
                used to improve features. Anonymous and aggregated.
              </li>
            </ul>
          </Section>

          <SectionDivider />

          <Section
            id="section-02"
            number="02"
            title="How we use it"
          >
            <p>
              Your data is used only to run and improve the app for you.
              Specifically:
            </p>
            <ul className="flex flex-col gap-2 pl-5 [list-style-type:disc]">
              <li>To analyze outfit photos and identify clothing pieces.</li>
              <li>To log outfits to your calendar and wardrobe history.</li>
              <li>
                To send notifications you&apos;ve opted in to — reminders, recap
                emails, and processing updates.
              </li>
              <li>
                To personalize suggestions based on your style preferences,
                size, and wear history.
              </li>
            </ul>
            <p className="border-l-2 border-[#383733] dark:border-foreground/80 pl-4 py-0.5 italic text-xs md:text-sm text-foreground/90 my-1">
              We do not use your data to train AI models without your explicit
              consent. Your wardrobe is yours.
            </p>
          </Section>

          <SectionDivider />

          <Section
            id="section-03"
            number="03"
            title="What we don't do"
          >
            <ul className="flex flex-col gap-2 pl-5 [list-style-type:disc]">
              <li>Sell your personal data to third parties.</li>
              <li>Show you ads based on your wardrobe or behavior.</li>
              <li>
                Share your photos, measurements, or outfit history with other
                users.
              </li>
              <li>
                Access your camera or gallery without an active upload action
                from you.
              </li>
            </ul>
          </Section>

          <SectionDivider />

          <Section
            id="section-04"
            number="04"
            title="Third-party services"
          >
            <p>
              We use a small set of trusted services to run the app. They only
              receive the data they need to do their job.
            </p>
            <ul className="flex flex-col gap-2 pl-5 [list-style-type:disc]">
              <li>Cloud storage</li>
              <li>Image processing AI</li>
              <li>Push notifications</li>
              <li>Analytics (anonymous)</li>
            </ul>
            <p>
              None of these partners are permitted to use your data for their
              own purposes.
            </p>
          </Section>

          <SectionDivider />

          <Section
            id="section-05"
            number="05"
            title="Your rights"
          >
            <p>You&apos;re in control of your data at all times.</p>
            <ul className="flex flex-col gap-2 pl-5 [list-style-type:disc]">
              <li>
                <strong>Access</strong> — export everything in your wardrobe
                from Settings.
              </li>
              <li>
                <strong>Edit</strong> — update or remove any data from your
                profile or wardrobe at any time.
              </li>
              <li>
                <strong>Delete</strong> — delete your account to permanently
                remove all your data from our servers within 30 days.
              </li>
              <li>
                <strong>Opt out</strong> — turn off any notification or data
                collection toggle in Settings.
              </li>
            </ul>
          </Section>

          <SectionDivider />

          <Section
            id="section-06"
            number="06"
            title="How we keep it safe"
          >
            <p>
              Your data is encrypted in transit and at rest. Passwords are
              hashed — we don&apos;t store them in plain text and neither does
              anyone else. We conduct regular security reviews and limit
              internal access to your data to only what&apos;s necessary.
            </p>
            <p>
              If there&apos;s ever a breach that affects your data, we&apos;ll
              notify you within 72 hours.
            </p>
          </Section>

          <SectionDivider />

          <Section
            id="section-07"
            number="07"
            title="Under 13"
          >
            <p>
              Loomette is not intended for users under the age of 13. We
              don&apos;t knowingly collect data from children. If you believe we
              have, email us at hi@loomette.id and we&apos;ll delete it
              promptly.
            </p>
          </Section>

          <SectionDivider />

          <Section
            id="section-08"
            number="08"
            title="When this policy changes"
          >
            <p>
              If we make meaningful changes to this policy, we&apos;ll notify
              you in the app before they take effect. You&apos;ll always be
              able to read the current version here.
            </p>
            <p>
              Continuing to use Loomette after a change means you&apos;ve
              accepted the update. If you don&apos;t agree, you can delete your
              account before it takes effect.
            </p>
          </Section>

          <SectionDivider />

          {/* Questions Contact Callout */}
          <div className="flex flex-col gap-1.5 pt-2">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">
              Questions?
            </h3>
            <p className="font-sans text-xs md:text-sm text-muted-foreground">
              Reach us at{" "}
              <a
                href="mailto:hi@loomette.id"
                className="underline hover:text-foreground transition-colors"
              >
                hi@loomette.id
              </a>
              {" "}— we actually read these.
            </p>
          </div>
        </div>
      </div>

      {/* Centered Version Footer */}
      <footer className="mt-16 mb-8 text-center">
        <p className="font-sans text-[11px] text-[#A8A49A] tracking-wider">
          loomette · privacy & policy · version 0.0.1
        </p>
      </footer>
    </main>
  );
}
