import type { Metadata } from "next";
import { Jost, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  // Several screens set font-style: italic on serif text (Calendar's
  // "outfit", onboarding's "all set", ...) -- without this, next/font
  // only fetches the normal style, so the browser synthesizes a fake
  // slanted italic instead of using Source Serif's real italic design.
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Loomette",
  description: "Loomette — fashion, made for Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
