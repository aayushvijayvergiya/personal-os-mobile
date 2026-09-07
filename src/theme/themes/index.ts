import type { Theme, ThemeId } from "../tokens";
import { chicago } from "./chicago";
import { luna } from "./luna";
import { slate } from "./slate";

export const THEMES: Record<ThemeId, Theme> = { chicago, luna, slate };
export const THEME_LIST: Theme[] = [chicago, luna, slate];
export const DEFAULT_THEME_ID: ThemeId = "chicago";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && v in THEMES;
}
