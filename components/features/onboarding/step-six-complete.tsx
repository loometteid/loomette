import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function StepSixComplete() {
  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <div className="relative h-64 w-full">
        <Image
          src="/brand/asterisk-silver.png"
          alt=""
          width={218}
          height={270}
          className="pointer-events-none absolute top-0 left-[38%] w-16"
        />
        <Image
          src="/brand/asterisk-black.png"
          alt=""
          width={218}
          height={270}
          className="pointer-events-none absolute top-16 -left-10 w-36"
        />
        <Image
          src="/brand/asterisk-silver.png"
          alt=""
          width={218}
          height={270}
          className="pointer-events-none absolute top-10 right-0 w-52"
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          You&apos;re <em className="font-bold italic">all set</em>.
        </Typography>
        <Typography variant="subtitle">Your wardrobe is waiting.</Typography>
      </div>

      <Button type="button" disabled className="w-full">
        Continue
      </Button>
    </main>
  );
}
