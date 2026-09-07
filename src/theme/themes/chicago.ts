import type { Theme } from "../tokens";

/** Theme 1 — faithful Windows 95 port of the web app. Default. */
export const chicago: Theme = {
  id: "chicago",
  name: "Chicago",
  dark: false,
  color: {
    desk: "#d4d0c8",
    face: "#c0c0c0",
    light: "#ffffff",
    dark: "#808080",
    darker: "#404040",
    text: "#000000",
    textMuted: "#444444",
    titleA: "#000080",
    titleB: "#1084d0",
    titleText: "#ffffff",
    highlight: "#000080",
    highlightText: "#ffffff",
    paper: "#ffffff",
    paperTint: "#ffffe1",
    danger: "#aa0000",
    link: "#000080",
    progress: "#000080",
    overlay: "rgba(0,0,0,0.3)",
    cork: "#d4b896",
    corkStripe: "#ccb08e",
  },
  metric: { bevel: 2, radius: 0, font: 15, fontSmall: 13, titleFont: 14, tap: 44, gap: 6 },
  // The typeface is a user preference merged in by ThemeProvider, not a per-theme choice.
  font: {},
};
