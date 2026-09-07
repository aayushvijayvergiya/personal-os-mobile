export type ThemeId = "chicago" | "luna" | "slate";

export interface Theme {
  id: ThemeId;
  name: string;
  /** Drives StatusBar style and keyboard appearance. */
  dark: boolean;
  color: {
    desk: string;
    face: string;
    light: string;
    dark: string;
    darker: string;
    text: string;
    textMuted: string;
    titleA: string;
    titleB: string;
    titleText: string;
    highlight: string;
    highlightText: string;
    paper: string;
    paperTint: string;
    danger: string;
    link: string;
    progress: string;
    overlay: string;
    cork: string;
    corkStripe: string;
  };
  metric: {
    bevel: number;
    radius: number;
    font: number;
    fontSmall: number;
    titleFont: number;
    tap: number;
    gap: number;
  };
  font: { family?: string; bold?: string };
}

export const COLOR_TOKENS = [
  "desk", "face", "light", "dark", "darker", "text", "textMuted", "titleA", "titleB", "titleText",
  "highlight", "highlightText", "paper", "paperTint", "danger", "link", "progress", "overlay", "cork", "corkStripe",
] as const satisfies readonly (keyof Theme["color"])[];

export const METRIC_TOKENS = [
  "bevel", "radius", "font", "fontSmall", "titleFont", "tap", "gap",
] as const satisfies readonly (keyof Theme["metric"])[];
