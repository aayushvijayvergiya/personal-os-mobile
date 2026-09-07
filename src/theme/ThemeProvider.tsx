import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_FONT_ID,
  FONT_CHOICES,
  isFontId,
  type FontChoice,
  type FontId,
} from "./fontNames";
import type { Theme, ThemeId } from "./tokens";
import { DEFAULT_THEME_ID, THEMES, THEME_LIST, isThemeId } from "./themes";

export const THEME_STORAGE_KEY = "personalos.theme";
export const FONT_STORAGE_KEY = "personalos.font";

export interface ThemeContextValue {
  theme: Theme;
  themes: Theme[];
  setThemeId: (id: ThemeId) => void;
  fonts: FontChoice[];
  fontId: FontId;
  setFontId: (id: FontId) => void;
}

const DEFAULT_FONT = FONT_CHOICES.find((f) => f.id === DEFAULT_FONT_ID)!;

export const ThemeContext = createContext<ThemeContextValue>({
  theme: { ...THEMES[DEFAULT_THEME_ID], font: DEFAULT_FONT },
  themes: THEME_LIST,
  setThemeId: () => {},
  fonts: FONT_CHOICES,
  fontId: DEFAULT_FONT_ID,
  setFontId: () => {},
});

export function ThemeProvider({
  children,
  initialId,
  initialFontId,
}: {
  children: React.ReactNode;
  initialId?: ThemeId;
  initialFontId?: FontId;
}) {
  const [id, setId] = useState<ThemeId>(initialId ?? DEFAULT_THEME_ID);
  const [fontId, setFont] = useState<FontId>(initialFontId ?? DEFAULT_FONT_ID);

  useEffect(() => {
    if (initialId) return;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (isThemeId(saved)) setId(saved);
      })
      .catch(() => {});
  }, [initialId]);

  useEffect(() => {
    if (initialFontId) return;
    AsyncStorage.getItem(FONT_STORAGE_KEY)
      .then((saved) => {
        if (isFontId(saved)) setFont(saved);
      })
      .catch(() => {});
  }, [initialFontId]);

  const setThemeId = useCallback((next: ThemeId) => {
    setId(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const setFontId = useCallback((next: FontId) => {
    setFont(next);
    AsyncStorage.setItem(FONT_STORAGE_KEY, next).catch(() => {});
  }, []);

  /** The typeface is a user preference, so it is merged over whatever the theme declares. */
  const value = useMemo(() => {
    const choice = FONT_CHOICES.find((f) => f.id === fontId) ?? DEFAULT_FONT;
    const theme: Theme = {
      ...THEMES[id],
      font: { family: choice.family, bold: choice.bold },
    };
    return { theme, themes: THEME_LIST, setThemeId, fonts: FONT_CHOICES, fontId, setFontId };
  }, [id, fontId, setThemeId, setFontId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
