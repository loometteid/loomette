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
