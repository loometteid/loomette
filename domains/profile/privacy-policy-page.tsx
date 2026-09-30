"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-muted-foreground text-xs tracking-wide">
        {number}
      </span>
      <Typography variant="h1" as="h2">
        {title}
      </Typography>
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function PrivacyPolicyView() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Privacy & Policy
          </Typography>
        </div>
        <Typography variant="subtitle">Last updated: June 2026</Typography>
      </div>

      <Section number="01" title="What we collect">
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

      <Section number="02" title="How we use it">
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
        <p className="border-border text-muted-foreground border-l-2 pl-4">
          We do not use your data to train AI models without your explicit
          consent. Your wardrobe is yours.
        </p>
      </Section>

      <Section number="03" title="What we don't do">
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

      <Section number="04" title="Third-party services">
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

      <Section number="05" title="Your rights">
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

      <Section number="06" title="How we keep it safe">
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

      <Section number="07" title="Under 13">
        <p>
          TBD is not intended for users under the age of 13. We
          don&apos;t knowingly collect data from children. If you believe we
          have,
        </p>
      </Section>

      <Section number="08" title="When this policy changes">
        <p>
          If we make meaningful changes to this policy, we&apos;ll notify
          you in the app before they take effect. You&apos;ll always be
          able to read the current version here.
        </p>
        <p>
          Continuing to use Closet. after a change means you&apos;ve
          accepted the update. If you don&apos;t agree, you can delete your
          account before it takes effect.
        </p>
      </Section>

      <div className="flex flex-col gap-1 pt-4 pb-4 text-center">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Questions?
        </span>
        <span className="text-muted-foreground text-xs">
          Reach us at hello@tbd.app — we actually read these.
        </span>
        <span className="text-muted-foreground/70 mt-4 text-[0.65rem] tracking-wide uppercase">
          TBD · Privacy & Policy · Version 0.0.1
        </span>
      </div>
    </main>
  );
}
