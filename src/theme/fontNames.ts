/**
 * Font choices. Kept free of imports so themes (and their tests) never pull in the font asset
 * package; the loader lives in `./fonts`.
 *
 * IBM Plex Sans is the default: it carries computing heritage, so it still reads as a retro
 * machine UI, but it is a real text face and stays sharp at 13–15px on a phone.
 * "System" falls back to San Francisco / Roboto for anyone who wants maximum clarity.
 */
export type FontId = "plex" | "system";

export const FONT_REGULAR = "IBMPlexSans_400Regular";
export const FONT_BOLD = "IBMPlexSans_600SemiBold";

export interface FontChoice {
  id: FontId;
  name: string;
  description: string;
  family?: string;
  bold?: string;
}

export const FONT_CHOICES: FontChoice[] = [
  {
    id: "plex",
    name: "IBM Plex Sans",
    description: "Retro computing character, built for screens.",
    family: FONT_REGULAR,
    bold: FONT_BOLD,
  },
  {
    id: "system",
    name: "System",
    description: "Your phone's own typeface. The clearest option.",
  },
];

export const DEFAULT_FONT_ID: FontId = "plex";

export function isFontId(value: unknown): value is FontId {
  return value === "plex" || value === "system";
}
