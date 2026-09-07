import type { Theme } from "../tokens";

/** Theme 2 — Windows XP "Luna": cream panels, saturated blue title bars, soft bevels. Light. */
export const luna: Theme = {
  id: "luna",
  name: "Luna",
  dark: false,
  color: {
    desk: "#ece9d8",
    face: "#f1efe2",
    light: "#ffffff",
    dark: "#aca899",
    darker: "#716f64",
    text: "#000000",
    textMuted: "#5b5a52",
    titleA: "#0a5fd6",
    titleB: "#3d95ff",
    titleText: "#ffffff",
    highlight: "#316ac5",
    highlightText: "#ffffff",
    paper: "#ffffff",
    paperTint: "#fff9d6",
    danger: "#d13438",
    link: "#0046d5",
    progress: "#2fb43a",
    overlay: "rgba(20,40,80,0.35)",
    cork: "#d9bf98",
    corkStripe: "#d0b48d",
  },
  metric: { bevel: 1, radius: 3, font: 15, fontSmall: 13, titleFont: 14, tap: 44, gap: 6 },
  // The typeface is a user preference merged in by ThemeProvider, not a per-theme choice.
  font: {},
};
