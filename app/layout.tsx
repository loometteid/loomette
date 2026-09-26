import type { Metadata } from "next";
import { Poppins, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// The design system (figma/Typography.png) specifies Avenir Next for
// body/sans text. Avenir Next is a commercial Monotype font with no
// free/open license -- it isn't on next/font/google, and we don't have
// a licensed source (Adobe Fonts kit, purchased webfont files) for it.
// Poppins is the closest widely-used free substitute (same geometric-
// sans character, full weight range) until a licensed Avenir Next
// source exists -- swap it in here the moment one does.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export const instant = false;

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
      className={`${poppins.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
