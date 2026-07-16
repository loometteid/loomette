import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Registers our custom type scale (text-mega-title/title/h1/subtitle,
// defined in app/globals.css) as font-size utilities. Without this,
// tailwind-merge doesn't recognize them and falls back to lumping them
// into the generic text-color conflict group — meaning any text-color
// className (e.g. text-white) passed alongside a Typography variant
// silently strips the font-size class instead of just overriding color.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["mega-title", "title", "h1", "subtitle"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
