"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import silverHangerImage from "@/public/brand/mascot-image-42.png";
import blackHangerImage from "@/public/brand/mascot-image-43.png";
import blackPuffballImage from "@/public/brand/mascot-image-44.png";
import whitePuffballImage from "@/public/brand/mascot-image-45.png";

export function StepSixComplete() {
  return (
    <main
      data-testid="onboarding-step-six"
      className="relative flex min-h-dvh w-full flex-col justify-between bg-[#FAFAF7] overflow-hidden select-none"
    >
      {/* ============================================================== */}
      {/* MOBILE VIEWPORT (<1024px)                                      */}
      {/* ============================================================== */}
      <div className="flex flex-1 flex-col justify-between px-6 py-8 lg:hidden">
        {/* Mascot Composition (Mobile) */}
        <div className="relative h-96 w-full overflow-visible">
          {/* Black Hanger (Top Left) */}
          <div className="pointer-events-none absolute -top-8 -left-12 w-64 drop-shadow-lg z-10">
            <Image
              src={blackHangerImage}
              alt=""
              width={600}
              height={400}
              priority
              className="w-full h-auto"
            />
          </div>

          {/* White Fluffy Puffball (Top Right) */}
          <div className="pointer-events-none absolute top-4 right-16 w-32 drop-shadow-md z-10">
            <Image
              src={whitePuffballImage}
              alt=""
              width={400}
              height={400}
              priority
              className="w-full h-auto"
            />
          </div>

          {/* Silver Hanger (Middle/Bottom Right) */}
          <div className="pointer-events-none absolute top-36 right-[-2.5rem] w-64 drop-shadow-xl z-20">
            <Image
              src={silverHangerImage}
              alt=""
              width={600}
              height={400}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Text Content & Primary Action */}
        <div className="flex flex-col gap-8 pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkle className="size-6 text-foreground shrink-0" />
              <h1
                data-testid="onboarding-step-six__title"
                className="text-3xl font-serif text-foreground leading-tight"
              >
                You&apos;re{" "}
                <span className="italic font-normal underline decoration-1 underline-offset-4">
                  all set.
                </span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium pl-8">
              Your wardrobe is waiting.
            </p>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/onboarding/7" />}
            data-testid="onboarding-step-six__continue-button"
            className="w-full h-12 rounded-2xl text-xs uppercase tracking-widest font-semibold"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP VIEWPORT (lg: >=1024px)                                */}
      {/* ============================================================== */}
      <div className="hidden lg:flex relative h-screen w-full items-center justify-end px-16 xl:px-28">
        {/* Mascot Composition (Desktop) */}
        {/* 1. Black Hanger: Middle-Left */}
        <div className="pointer-events-none absolute left-[4%] top-[24%] w-80 xl:w-96 drop-shadow-xl z-10">
          <Image
            src={blackHangerImage}
            alt=""
            width={600}
            height={400}
            priority
            className="w-full h-auto"
          />
        </div>

        {/* 2. White Fluffy Puffball: Top-Center */}
        <div className="pointer-events-none absolute left-[32%] xl:left-[35%] top-[14%] w-44 xl:w-52 drop-shadow-md z-10">
          <Image
            src={whitePuffballImage}
            alt=""
            width={400}
            height={400}
            priority
            className="w-full h-auto"
          />
        </div>

        {/* 3. Silver Hanger: Bottom-Center */}
        <div className="pointer-events-none absolute left-[22%] xl:left-[24%] bottom-[4%] w-96 xl:w-[28rem] drop-shadow-2xl z-20">
          <Image
            src={silverHangerImage}
            alt=""
            width={600}
            height={400}
            priority
            className="w-full h-auto"
          />
        </div>

        {/* 4. Black Fluffy Puffball: Top-Right Corner */}
        <div className="pointer-events-none absolute -top-10 -right-8 xl:-right-6 w-56 xl:w-64 drop-shadow-2xl z-10">
          <Image
            src={blackPuffballImage}
            alt=""
            width={400}
            height={400}
            priority
            className="w-full h-auto"
          />
        </div>

        {/* Right Content Panel (Desktop) */}
        <div className="relative z-30 flex flex-col items-start gap-6 max-w-sm mr-8 xl:mr-16">
          <div className="flex flex-col gap-3">
            <h1
              data-testid="onboarding-step-six__title--desktop"
              className="text-5xl xl:text-6xl font-serif text-foreground leading-[1.12]"
            >
              You&apos;re
              <br />
              <span className="italic font-normal">all set.</span>
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Your wardrobe is waiting.
            </p>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/onboarding/7" />}
            data-testid="onboarding-step-six__continue-button--desktop"
            className="px-10 h-12 rounded-xl text-xs uppercase tracking-widest font-semibold shadow-sm"
          >
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
