import type { Theme } from "../tokens";

/** Theme 3 — Windows 95 "Slate" colour scheme reinterpreted as a dark mode. */
export const slate: Theme = {
  id: "slate",
  name: "Slate",
  dark: true,
  color: {
    desk: "#1e2228",
    face: "#3a3f47",
    light: "#5c626c",
    dark: "#1a1d21",
    darker: "#0b0d0f",
    text: "#e8e8e8",
    textMuted: "#a9adb3",
    titleA: "#1f3a5f",
    titleB: "#3d6ea5",
    titleText: "#ffffff",
    highlight: "#7fbfff",
    highlightText: "#0b0d0f",
    paper: "#262a30",
    paperTint: "#3a3626",
    danger: "#ff6b6b",
    link: "#8ec5ff",
    progress: "#7fbfff",
    overlay: "rgba(0,0,0,0.55)",
    cork: "#4a3d2c",
    corkStripe: "#42362a",
  },
  metric: { bevel: 2, radius: 0, font: 15, fontSmall: 13, titleFont: 14, tap: 44, gap: 6 },
  // The typeface is a user preference merged in by ThemeProvider, not a per-theme choice.
  font: {},
};
